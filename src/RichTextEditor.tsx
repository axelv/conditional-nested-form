import { useEffect } from 'react';

import { InitialConfigType, LexicalComposer } from '@lexical/react/LexicalComposer';
import { PlainTextPlugin } from '@lexical/react/LexicalPlainTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import LexicalErrorBoundary from '@lexical/react/LexicalErrorBoundary';
import { Control, FieldValues, Path, UseFormRegister, UseFormUnregister, useController } from 'react-hook-form';
import classNames from 'classnames';
import { SerializedEditorState, SerializedLexicalNode } from 'lexical';
import MentionPlugin from './MentionPlugin';
import { MentionNode } from './MentionNode';

const theme = {}


type EditorProps<TFieldValues extends FieldValues> = {
    name: Path<TFieldValues>;
    className?: string;
    control?: Control<TFieldValues>
    register?: UseFormRegister<TFieldValues>
    unregister?: UseFormUnregister<TFieldValues>
}
type State = SerializedEditorState<SerializedLexicalNode>

function Editor<TFieldValues extends FieldValues>({ name, control, className }: EditorProps<TFieldValues>) {
    const { field } = useController({ name, control })
    const initialConfig: InitialConfigType = {
        namespace: 'Editor',
        theme,
        onError,
        editorState: field.value,
        nodes: [MentionNode]
    }
    return (
        <div className={classNames('relative', className)}>
            <LexicalComposer initialConfig={initialConfig}>
                <PlainTextPlugin
                    contentEditable={<ContentEditable onBlur={field.onBlur} className='border border-gray-200 rounded p-1' />}
                    placeholder={
                        <div className='absolute -z-10 inset-1 select-none text-gray-400'>
                            Enter suggestions
                        </div>
                    }
                    ErrorBoundary={LexicalErrorBoundary}
                />
                <HistoryPlugin />
                <MentionPlugin control={control} />
                <OnChangePlugin onChange={field.onChange} />
            </LexicalComposer>
        </div>
    )
}
export default Editor;

function onError(error: Error) {
    console.error(error);
}

function OnChangePlugin({ onChange }: { onChange?: (state: State) => void }) {
    const [editor] = useLexicalComposerContext();

    useEffect(() => {
        return editor.registerUpdateListener(
            ({ editorState }) => {
                onChange?.(editorState.toJSON())
            }
        )
    }, [editor, onChange])
    return null;
}


