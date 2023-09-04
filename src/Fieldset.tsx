import Field, { TField } from "./Field";
import { PathPrefixContext } from "./PathPrefix";
import { EnabledWhen, useEnabled } from "./useEnabled";
import { ArrayPath, Control, FieldArray, FieldValues, UseFormWatch } from "react-hook-form";
import useFieldPath from "./useFieldPath";
import { FieldArray as RenderFieldArray } from "./FieldArray";

export type TFieldset =
    | {
        legend: string;
        repeating?: boolean
        fields: TField[]
        fieldsets?: never
        enabledWhen?: EnabledWhen
        defaultEnabled?: boolean
    }
    | {
        legend: string;
        repeating?: boolean
        fieldsets: TFieldset[]
        fields?: never
        enabledWhen?: EnabledWhen
        defaultEnabled?: boolean
    }

type FieldsetProps<TFieldValues extends FieldValues = FieldValues> = TFieldset & {
    watch: UseFormWatch<TFieldValues>
    control: Control<TFieldValues>
    children: (args: TField & { name: string, enabled: boolean }) => React.ReactNode
}

export default function Fieldset<TFieldValues extends FieldValues = FieldValues>
    ({ repeating, watch, control, legend, fields, fieldsets, enabledWhen, defaultEnabled, children }: FieldsetProps<TFieldValues>) {
    const enabled = useEnabled(watch, enabledWhen, defaultEnabled);
    const path = useFieldPath(legend);
    if (repeating) {
        return (
            <RenderFieldArray name={path as ArrayPath<TFieldValues>} control={control}>
                {({ fields: fieldsArray, append, remove }) =>
                    <div className="flex flex-col items-stretch">
                        {fieldsArray.length == 0 && (
                            <fieldset disabled={!enabled} className="relative border-l-2 border-gray-200 mt-4 ml-2 pl-2">
                                <div className="absolute -left-[4px] -top-3 bg-gray-200 rounded-full w-1.5 h-1.5" />
                                <legend className="font-medium">{legend}</legend>
                                <PathPrefixContext.Provider value={`${path}.0`}>
                                    {fields?.map((field) => <Field key={field.label} watch={watch} control={control} {...field} >{children}</Field>)}
                                    <div className="ml-2">
                                        {fieldsets?.map((fieldset) => <Fieldset key={fieldset.legend} {...fieldset} watch={watch} control={control} >{children}</Fieldset>)}
                                    </div>
                                </PathPrefixContext.Provider>
                            </fieldset>
                        )}
                        {fieldsArray.map(({ id }, index) => (
                            <fieldset key={id} disabled={!enabled} className="relative border-l-2 border-gray-200 mt-4 ml-2 pl-2">
                                <div className="absolute -left-[4px] -top-3 bg-gray-200 rounded-full w-1.5 h-1.5" />
                                <legend className="font-medium">
                                    <span>{legend}</span>
                                    <button className="mx-1 text-gray-400 hover:text-gray-800" type="button" onClick={() => remove(index)}>X</button>
                                </legend>
                                <PathPrefixContext.Provider value={`${path}.${index}`}>
                                    {fields?.map((field) => <Field key={field.label} watch={watch} control={control} {...field} >{children}</Field>)}
                                    <div className="ml-2">
                                        {fieldsets?.map((fieldset) => <Fieldset key={fieldset.legend} {...fieldset} watch={watch} control={control} >{children}</Fieldset>)}
                                    </div>
                                </PathPrefixContext.Provider>
                            </fieldset>
                        ))}
                        <button className="ml-2 mt-1 block border border-gray-200 hover:enabled:bg-gray-50 hover:enabled:border-gray-400 disabled:bg-gray-100 disabled:text-gray-400 p-1 rounded" type="button" onClick={() => append({} as FieldArray<TFieldValues, ArrayPath<TFieldValues>>)}>
                            {`Add '${legend}'`}
                        </button>
                    </div>
                }
            </RenderFieldArray>
        )
    }
    return (
        <fieldset disabled={!enabled} className="relative border-l-2 border-gray-200 mt-4 ml-2 pl-2">
            <div className="absolute -left-[4px] -top-3 bg-gray-200 rounded-full w-1.5 h-1.5" />
            <legend className="font-medium">{legend}</legend>
            <PathPrefixContext.Provider value={path}>
                {fields?.map((field) => <Field key={field.label} watch={watch} control={control} {...field} >{children}</Field>)}
                <div className="ml-2">
                    {fieldsets?.map((fieldset) => <Fieldset key={fieldset.legend} {...fieldset} watch={watch} control={control} >{children}</Fieldset>)}
                </div>
            </PathPrefixContext.Provider>
        </fieldset>
    )
}