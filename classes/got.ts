import got from "got";

export interface GotModuleOptions {
    headers?: Record<string, string>;
    timeout?: { request?: number };
    [key: string]: unknown;
}

export interface GotModule {
    name: string;
    optionsType: "object" | "function";
    options: GotModuleOptions | ((...args: unknown[]) => GotModuleOptions);
    parent: string | null;
    description: string;
}

export interface GotRequestOptions {
    url: string;
    method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
    headers?: Record<string, string>;
    json?: unknown;
    [key: string]: unknown;
}

class Got {
    #children = new Map<string, GotModule>();

    async importData(): Promise<void> {
        const modules = await import("../gots");

        for (const mod of Object.values(modules)) {
            if (this.#isGotModule(mod)) {
                this.#add(mod);
            }
        }
    }

    #isGotModule(mod: unknown): mod is GotModule {
        return (
            typeof mod === "object" &&
            mod !== null &&
            "name" in mod &&
            "options" in mod
        );
    }

    #add(module: GotModule): void {
        this.#children.set(module.name.toLowerCase(), module);
    }

    #resolveOptions(moduleName: string, ...args: unknown[]): GotModuleOptions {
        const module = this.#children.get(moduleName.toLowerCase());
        if (!module) {
            throw new Error(`Got module not found: ${moduleName}`);
        }

        // Get parent options first (recursive)
        let parentOptions: GotModuleOptions = {};
        if (module.parent) {
            parentOptions = this.#resolveOptions(module.parent, ...args);
        }

        // Get current module options
        let currentOptions: GotModuleOptions;
        if (module.optionsType === "function" && typeof module.options === "function") {
            currentOptions = module.options(...args);
        } else {
            currentOptions = module.options as GotModuleOptions;
        }

        // Deep merge: parent + current (current takes precedence)
        return this.#mergeOptions(parentOptions, currentOptions);
    }

    #mergeOptions(parent: GotModuleOptions, child: GotModuleOptions): GotModuleOptions {
        return {
            ...parent,
            ...child,
            headers: {
                ...(parent.headers || {}),
                ...(child.headers || {}),
            },
        };
    }

    async request<T = unknown>(
        moduleName: string,
        requestOptions: GotRequestOptions,
        ...args: unknown[]
    ): Promise<T> {
        const { url, ...restRequestOptions } = requestOptions;

        const resolvedOptions = this.#resolveOptions(moduleName, ...args);
        const mergedOptions = this.#mergeOptions(resolvedOptions, restRequestOptions);

        const finalOptions = {
            ...mergedOptions,
            headers: {
                ...(resolvedOptions.headers || {}),
                ...(restRequestOptions.headers || {}),
            },
        };

        const response = await got(url, {
            ...finalOptions,
            responseType: "json" as const,
        });

        return response.body as T;
    }

    get modules(): Map<string, GotModule> {
        return this.#children;
    }
}

export default Got;
