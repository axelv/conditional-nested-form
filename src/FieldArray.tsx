import React from 'react';
import { FieldValues, UseFieldArrayProps, UseFieldArrayReturn, useFieldArray, FieldArrayPath } from 'react-hook-form';


export const FieldArray = <TFieldValues extends FieldValues, TFieldArrayName extends FieldArrayPath<TFieldValues>, TKeyName extends string = "id">({ children, ...props }: UseFieldArrayProps<TFieldValues, TFieldArrayName, TKeyName> & { children: (props: UseFieldArrayReturn<TFieldValues, TFieldArrayName, TKeyName>) => React.ReactNode; }) => {
    const fieldArrayMethods = useFieldArray(props);
    return children(fieldArrayMethods);
};
