import { useEffect, useState } from 'react'
import Fieldset, { TFieldset } from './Fieldset'
import { useForm } from 'react-hook-form'
import MarkdownEditor from './MarkdownEditor'
import RichtextEditor from "./RichTextEditor"
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels'
import { default as yaml } from "js-yaml"
import CodeEditor from './CodeEditor'

const FIELDSET: TFieldset[] = [
  {
    legend: 'Personal Information',
    fields: [
      {
        label: 'First Name',
        type: 'text',
        placeholder: 'First Name',
        defaultValue: 'John',
      },
      {
        label: 'Last Name',
        type: 'text',
        placeholder: 'Last Name',
        defaultValue: 'Doe',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        enabledWhen: (formData: Record<string, any>) => {
          return formData["personal-information"]?.['first-name'] === 'John'
        },
      }
    ],
  },
  {
    legend: 'Contact Information',
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    enabledWhen: (formData: Record<string, any>) => {
      return formData["personal-information"]?.["first-name"] === 'John' && formData["personal-information"]?.["last-name"] === 'Doe'
    },
    fieldsets: [
      {
        repeating: true,
        legend: 'Address',
        fields: [
          {
            label: 'Street',
            type: 'text',
            placeholder: 'Street',
          },
          {
            label: 'City',
            type: 'select',
            options: [
              { value: '1', text: 'New York' },
              { value: '2', text: 'Los Angeles' },
              { value: '3', text: 'Chicago' },
              { value: '4', text: 'Houston' },
            ]
          },
          {
            label: "Ziektespecifieke voorgeschiedenis",
            type: "markdown"
          },
          {
            repeating: true,
            label: "Familiale voorgeschiedenis",
            type: "markdown"
          }
        ]
      },
      {
        legend: 'Professional',
        templates: [
          {
            legend: 'Doctor',
            fields: [
              {
                label: 'Specialism',
                type: 'text',
                placeholder: 'specialism',
              },
              {
                label: 'RIZIV-Number',
                type: 'text',
                placeholder: 'RIZIV-Number',
              },
            ],
          },
          {
            legend: 'Nurse',
            fields: [
              {
                label: 'Department',
                type: 'text',
                placeholder: 'department',
              },
              {
                label: 'Ancienity',
                type: 'number',
                placeholder: 'ancienity',
              },
            ],
          }
        ],
      },
      {
        repeating: true,
        legend: 'Telecom',
        templates: [
          {
            legend: 'Telecom',
            fields: [
              {
                label: 'Email',
                type: 'text',
                placeholder: 'Email',
              },
              {
                label: 'Phone',
                type: 'text',
                placeholder: 'Phone',
              },
            ],
          },
          {
            legend: 'Social Media',
            fields: [
              {
                label: 'Twitter',
                type: 'text',
                placeholder: 'Twitter',
              },
              {
                label: 'Facebook',
                type: 'text',
                placeholder: 'Facebook',
              },
            ],
          }
        ],
      }
    ]
  },
]

function App() {
  const [definition, setDefinition] = useState(FIELDSET)

  const handleDefinitionUpdate = (value: string | undefined) => {
    try {
      if (!value) return
      const parsed = yaml.load(value) as TFieldset[]
      setDefinition(parsed)
    } catch (e) {
      console.error(e)
    }
  }
  const [data, setData] = useState({})
  const { register, unregister, control, setValue, handleSubmit, watch, resetField, reset } = useForm()
  useEffect(() => {
    reset()
  }, [definition, reset])
  return (
    <main className='ml-10 w-screen relative overflow-x-hidden'>
      <h1 className='text-lg font-medium'>Form with nested fields and conditional enabled fields</h1>
      <form onSubmit={handleSubmit(setData)} className='max-w-lg'>
        {definition.map((fieldset) => (
          <Fieldset key={fieldset.legend} form={{ watch, control, setValue, resetField }} {...fieldset}  >
            {({ name, type, defaultValue, placeholder, options, enabled }) => {
              switch (type) {
                case 'select':
                  return (
                    <select
                      {...register(name, { disabled: !enabled })}
                      className='px-1 pr-3 py-0.5 ml-2 disabled:bg-gray-50 disabled:text-gray-400 w-full'
                      id={name}
                      defaultValue={defaultValue}
                      placeholder={placeholder}
                    >
                      {options?.map(({ value, text }) => <option key={value} value={value}>{text}</option>)}
                    </select>
                  )
                case 'rich-text':
                  return <RichtextEditor className='grow ml-2' name={name} control={control} register={register} unregister={unregister} />
                case 'markdown':
                  return <MarkdownEditor className='grow ml-2' name={name} control={control} register={register} unregister={unregister} />
                default:
                  return (
                    <input
                      {...register(name, { disabled: !enabled })}
                      className='px-1 py-0.5 ml-2 disabled:bg-gray-50 disabled:text-gray-400 w-full'
                      type={type}
                      id={name}
                      placeholder={placeholder}
                      defaultValue={defaultValue}
                    />
                  )
              }
            }}
          </Fieldset>
        ))}
        <div className='mt-4'>
          <button type="submit" className='px-1.5 py-1 rounded border border-gray-200 hover:border-gray-400'>
            Submit
          </button>
        </div>
      </form>

      <PanelGroup direction="horizontal" className='w-full pt-4 mt-4 border-t border-gray-100'>
        <Panel defaultSize={50} minSize={20}>
          <h6 className='font-medium'>Form Definition</h6>
          <CodeEditor value={yaml.dump(definition, { indent: 4, skipInvalid: true })} onChange={handleDefinitionUpdate} />
        </Panel>
        <PanelResizeHandle />
        <Panel defaultSize={50} minSize={20}>
          <h6 className='font-medium'>Form Data</h6>
          <pre className='mt-4 text-xs'>{JSON.stringify(data, null, 2)}</pre>
        </Panel>
      </PanelGroup>
    </main >
  )
}

export default App
