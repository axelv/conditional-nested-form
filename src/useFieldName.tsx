export default function useFieldName(label: string) {
    //const namespace = useContext(FieldNamespaceContext)
    //return v5(label, namespace)
    return label.toLowerCase().replace(/ /g, "-")
}
