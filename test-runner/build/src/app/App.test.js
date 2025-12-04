"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("@testing-library/react");
const App_1 = require("./App");
const { PUBLIC_URL } = process.env;
test('renders learn react link', () => {
    (0, react_1.render)((0, jsx_runtime_1.jsx)(App_1.App, { basename: PUBLIC_URL }));
    const linkElement = react_1.screen.getByText(/learn react/i);
    expect(linkElement).toBeInTheDocument();
});
