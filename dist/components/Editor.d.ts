import * as react_jsx_runtime from 'react/jsx-runtime';

interface EditorProps {
    content: string;
    onChange: (content: string) => void;
}
declare function Editor({ content, onChange }: EditorProps): react_jsx_runtime.JSX.Element;

export { Editor };
