import { useContext } from "react"
import useFieldName from "./useFieldName"
import { PathPrefixContext } from "./PathPrefix"

export default function useFieldPath(label: string) {
    const name = useFieldName(label)
    const prefix = useContext(PathPrefixContext)
    if (prefix === '') return name
    return `${prefix}.${name}`
}