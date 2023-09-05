/* eslint-disable @typescript-eslint/no-explicit-any */
import Field, { TField } from "./Field";
import { PathPrefixContext } from "./PathPrefix";
import { EnabledWhen, useEnabled } from "./useEnabled";
import { ArrayPath, Control, FieldArray, FieldValues, Path, UseFormResetField, UseFormSetValue, UseFormWatch } from "react-hook-form";
import useFieldPath from "./useFieldPath";
import { FieldArray as RenderFieldArray } from "./FieldArray";
type BaseFieldset =
    | {
        legend: string
        enabledWhen?: EnabledWhen
        fieldsets?: never
        fields: TField[]
    }
    | {
        legend: string
        enabledWhen?: EnabledWhen
        fields?: never
        fieldsets: TFieldset[]
    }

type Simple<TProps> = TProps & { repeating?: false, templates?: never, legend: string }

type RepeatingSimple<TProps> = TProps & { repeating: true, templates?: never, legend: string }

type Template<TProps> = { templates: TProps[], repeating?: false, legend: string, enabledWhen?: never, fields?: never, fieldsets?: never }

type RepeatingTemplate<TProps> = { templates: TProps[], repeating: true, legend: string, enabledWhen?: never, fields?: never, fieldsets?: never }


export type TFieldset = Simple<BaseFieldset> | RepeatingSimple<BaseFieldset> | RepeatingTemplate<BaseFieldset> | Template<BaseFieldset>

export type FormProps<TFieldValues extends FieldValues = FieldValues> = {
    form: {
        watch: UseFormWatch<TFieldValues>
        control: Control<TFieldValues>
        setValue: UseFormSetValue<FieldValues>
        resetField: UseFormResetField<FieldValues>
    }
    children: (args: TField & { name: string, enabled: boolean }) => React.ReactNode
}


export default function Fieldset<TFieldValues extends FieldValues = FieldValues>
    ({ repeating, templates, children, form, ...other }: FormProps<TFieldValues> & TFieldset) {

    if (repeating && !templates)
        return <RepeatingSimpleFieldset form={form} templates={templates} {...other as RepeatingSimple<BaseFieldset>} repeating>{children}</RepeatingSimpleFieldset>

    if (repeating && templates)
        return <RepeatingTemplateFieldset form={form} templates={templates} legend={other.legend} repeating>{children}</RepeatingTemplateFieldset>

    if (templates)
        return <TemplateFieldset form={form} templates={templates} legend={other.legend}>{children}</TemplateFieldset>

    return <SimpleFieldset form={form} {...other as BaseFieldset}>{children}</SimpleFieldset>
}

function SimpleFieldset<TFieldValues extends FieldValues = FieldValues>
    ({ form, children, ...other }: FormProps<TFieldValues> & Simple<BaseFieldset>) {
    const path = useFieldPath(other.legend);
    return (
        <PathPrefixContext.Provider value={path}>
            <RenderBaseFieldset form={form}  {...other as BaseFieldset}>{children}</RenderBaseFieldset>
        </PathPrefixContext.Provider >
    )
}

function RepeatingSimpleFieldset<TFieldValues extends FieldValues = FieldValues>
    ({ form, children, ...other }: FormProps<TFieldValues> & RepeatingSimple<BaseFieldset>) {
    const path = useFieldPath(other.legend);
    return (
        <RenderFieldArray name={path as ArrayPath<TFieldValues>} control={form.control}>
            {({ fields, append, remove }) =>
                <>
                    {fields.length == 0 ? (
                        <PathPrefixContext.Provider value={`${path}.0`}>
                            <RenderBaseFieldset form={form}  {...other as BaseFieldset}>{children}</RenderBaseFieldset>
                        </PathPrefixContext.Provider>
                    ) : fields.map((field, index) => (
                        <PathPrefixContext.Provider value={`${path}.${index}`}>
                            <RenderBaseFieldset key={field.id} form={form} onRemove={() => remove(index)} {...other as BaseFieldset} legend={`${other.legend} ${index}`}>
                                {children}
                            </RenderBaseFieldset>
                        </PathPrefixContext.Provider>
                    ))}
                    <button
                        type="button"
                        className="ml-2 mt-1 block border border-gray-200 hover:enabled:bg-gray-50 hover:enabled:border-gray-400 disabled:bg-gray-100 disabled:text-gray-400 p-1 rounded"
                        onClick={() => append({} as any)}
                    >
                        {`Add '${other.legend}'`}
                    </button>
                </>}
        </RenderFieldArray >
    )
}


function TemplateFieldset<TFieldValues extends FieldValues = FieldValues>
    ({ form, children, templates, legend }: FormProps<TFieldValues> & Template<BaseFieldset>) {
    const path = useFieldPath(legend) as Path<TFieldValues>;
    const matchingTemplate = templates.find((template) => template.legend == form.watch<any>(`${path}.legend`))
    return (
        <PathPrefixContext.Provider value={path}>
            <fieldset className="relative border-l-2 border-gray-200 mt-4 ml-2 pl-2">
                <div className="absolute -left-[4px] -top-3 bg-gray-200 rounded-full w-1.5 h-1.5" />
                <legend className="font-medium">{legend}</legend>
                {matchingTemplate ?
                    <RenderBaseFieldset form={form} onRemove={() => form.resetField(path)} {...matchingTemplate}>{children}</RenderBaseFieldset> :
                    <div className="flex">
                        {templates.map((template) => (
                            <button
                                type="button"
                                className="ml-2 mt-1 block border border-gray-200 hover:enabled:bg-gray-50 hover:enabled:border-gray-400 disabled:bg-gray-100 disabled:text-gray-400 p-1 rounded"
                                onClick={() => form.setValue(`${path}.legend`, template.legend as any)}
                            >
                                {`Add '${template.legend}'`}
                            </button>
                        ))}
                    </div>
                }
            </fieldset>
        </PathPrefixContext.Provider >
    )
}



function RepeatingTemplateFieldset<TFieldValues extends FieldValues = FieldValues>
    ({ form, children, templates, legend }: FormProps<TFieldValues> & RepeatingTemplate<BaseFieldset>) {
    const path = useFieldPath(legend);
    return <RenderFieldArray name={path as ArrayPath<TFieldValues>} control={form.control}>
        {({ fields: fieldsArray, append, remove }) => (
            <fieldset className="relative border-l-2 border-gray-200 mt-4 ml-2 pl-2">
                <div className="absolute -left-[4px] -top-3 bg-gray-200 rounded-full w-1.5 h-1.5" />
                <legend className="font-medium">{legend}</legend>
                <div className="flex flex-col items-stretch">
                    {fieldsArray.map(({ id }, index) => {
                        const matchingTemplate = templates.find((template) => template.legend == form.watch<any>(`${path}.${index}.legend`))
                        if (!matchingTemplate) return null
                        return (
                            <PathPrefixContext.Provider value={`${path}.${index}`}>
                                <RenderBaseFieldset {...matchingTemplate} key={id} form={form} onRemove={() => remove(index)}>{children}</RenderBaseFieldset>
                            </PathPrefixContext.Provider>
                        )
                    })}
                    <div className="flex">
                        {templates.map((template) => (
                            <button
                                type="button"
                                className="ml-2 mt-1 block border border-gray-200 hover:enabled:bg-gray-50 hover:enabled:border-gray-400 disabled:bg-gray-100 disabled:text-gray-400 p-1 rounded"
                                onClick={() => append({ legend: template.legend } as FieldArray<TFieldValues, ArrayPath<TFieldValues>>)}
                            >
                                {`Add '${template.legend}'`}
                            </button>
                        ))}
                    </div>
                </div>
            </fieldset>
        )}
    </RenderFieldArray>
}


function RenderBaseFieldset<TFieldValues extends FieldValues = FieldValues>
    ({ form, children, legend, fields, fieldsets, enabledWhen, onRemove }: FormProps<TFieldValues> & BaseFieldset & { onRemove?: () => void }) {
    const enabled = useEnabled(form.watch, enabledWhen);
    return (
        <fieldset disabled={!enabled} className="relative border-l-2 border-gray-200 mt-4 ml-2 pl-2">
            <div className="absolute -left-[4px] -top-3 bg-gray-200 rounded-full w-1.5 h-1.5" />
            <legend className="font-medium">
                <span>{legend}</span>
                {onRemove && <button className="mx-1 text-gray-400 hover:text-gray-800" type="button" onClick={onRemove}>X</button>}
            </legend>
            {fields?.map((field) => <Field key={field.label} form={form} {...field} >{children}</Field>)}
            <div className="ml-2">
                {fieldsets?.map((fieldset) => <Fieldset key={fieldset.legend} {...fieldset} form={form}>{children}</Fieldset>)}
            </div>
        </fieldset>
    )
}