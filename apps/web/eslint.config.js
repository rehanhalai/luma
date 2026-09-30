import { config } from "@repo/eslint-config/react-internal";
import { plugin as shadcn } from "@shadcn/lint";

/** @type {import("eslint").Linter.Config[]} */
export default [
    ...config,
    {
        plugins: {
            shadcn,
        },
        rules: {
            // Examples:
            // "shadcn/no-restyle": ["error", { allow: ["layout"] }],
            // "shadcn/no-raw-colors": "error",
            // "shadcn/no-arbitrary-values": "error",
            // "shadcn/no-inline-styles": "error",
        },
    },
    {
        ignores: ['public/**']
    }
];
