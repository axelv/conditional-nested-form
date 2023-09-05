import { Editor } from "@monaco-editor/react";
import { Controller, useForm } from "react-hook-form";

export default function CodeEditor({ value: initialValue, onChange }: {
    value: string
    onChange: (value: string) => void
}) {
    const { handleSubmit, control } = useForm({ defaultValues: { code: initialValue } })
    return (
        <form
            onSubmit={handleSubmit(({ code }) => {
                onChange(code)
            })}
        >
            <Controller
                name="code"
                control={control}
                render={({ field }) => (
                    <Editor
                        height="800px"
                        language="yaml"
                        theme="vs-light"
                        {...field}
                        options={{
                            fontSize: 12,
                            formatOnType: true,
                            autoClosingBrackets: "languageDefined",
                        }}
                    />
                )}
            />
            <button type="submit">Update definition</button>
        </form>
    )
}