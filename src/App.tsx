import { useState } from 'react'
import Fieldset, { TFieldset } from './Fieldset'
import { useForm } from 'react-hook-form'
import MarkdownEditor from './MarkdownEditor'
import RichtextEditor from "./RichTextEditor"

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
            label: "Rich Text",
            type: "markdown"
          },
          {
            repeating: true,
            label: "Markdown",
            type: "markdown"
          }
        ]
      },
      {
        repeating: true,
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
      }
    ]
  },
]

function App() {
  const [data, setData] = useState({})
  const { register, unregister, control, handleSubmit, watch } = useForm()

  return (
    <main className='ml-10 max-w-lg'>
      <h1 className='text-lg font-medium'>Form with nested fields and conditional enabled fields</h1>
      <form onSubmit={handleSubmit(setData)} >
        {FIELDSET.map((fieldset) => (
          <Fieldset key={fieldset.legend} watch={watch} control={control} {...fieldset}  >
            {({ name, type, defaultValue, placeholder, options, enabled }) => {
              console.log("render field", name)
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

      <div className='flex gap-x-4 pt-4 mt-4 border-t border-gray-100'>
        <div>
          <h6 className='font-medium'>Form Definition</h6>
          <pre className='mt-4 text-xs'>{JSON.stringify(FIELDSET, null, 2)}</pre>
        </div>
        <div>
          <h6 className='font-medium'>Form Data</h6>
          <pre className='mt-4 text-xs'>{JSON.stringify(data, null, 2)}</pre>
        </div>
      </div>
    </main >
  )
}

export default App
