import { CollectionConfig } from 'payload/types'
import { AfterInput } from './AfterInput.jsx'
import { BeforeInput } from './BeforeInput.jsx'
import CustomError from './CustomError.jsx'
import CustomLabel from './CustomLabel.jsx'
import { defaultText, textFieldsSlug } from './shared.js'

const TextFields: CollectionConfig = {
  slug: textFieldsSlug,
  admin: {
    useAsTitle: 'text',
  },
  defaultSort: 'id',
  fields: [
    {
      name: 'text',
      type: 'text',
      required: true,
    },
    {
      name: 'localizedText',
      type: 'text',
      localized: true,
    },
    {
      name: 'i18nText',
      type: 'text',
      admin: {
        description: {
          en: 'en description',
          es: 'es description',
        },
        placeholder: {
          en: 'en placeholder',
          es: 'es placeholder',
        },
      },
      label: {
        en: 'Text en',
        es: 'Text es',
      },
    },
    {
      name: 'defaultString',
      type: 'text',
      defaultValue: defaultText,
    },
    {
      name: 'defaultEmptyString',
      type: 'text',
      defaultValue: '',
    },
    {
      name: 'defaultFunction',
      type: 'text',
      defaultValue: () => defaultText,
    },
    {
      name: 'defaultAsync',
      type: 'text',
      defaultValue: async (): Promise<string> => {
        return new Promise(resolve =>
          setTimeout(() => {
            resolve(defaultText)
          }, 1),
        )
      },
    },
    {
      name: 'overrideLength',
      type: 'text',
      label: 'Override the 40k text length default',
      maxLength: 50000,
    },
    {
      name: 'fieldWithDefaultValue',
      type: 'text',
      defaultValue: async () => {
        const defaultValue = new Promise(resolve => setTimeout(() => resolve('some-value'), 1000))

        return defaultValue
      },
    },
    {
      name: 'dependentOnFieldWithDefaultValue',
      type: 'text',
      hooks: {
        beforeChange: [
          ({ data }) => {
            return data?.fieldWithDefaultValue || ''
          },
        ],
      },
    },
    {
      name: 'customLabel',
      type: 'text',
      admin: {
        components: {
          Label: CustomLabel,
        },
      },
    },
    {
      name: 'customError',
      type: 'text',
      admin: {
        components: {
          Error: CustomError,
        },
      },
      minLength: 3,
    },
    {
      name: 'beforeAndAfterInput',
      type: 'text',
      admin: {
        components: {
          afterInput: [AfterInput],
          beforeInput: [BeforeInput],
        },
      },
    },
    {
      name: 'hasMany',
      type: 'text',
      hasMany: true,
    },
    {
      name: 'validatesHasMany',
      type: 'text',
      hasMany: true,
      minLength: 3,
    },
    {
      name: 'localizedHasMany',
      type: 'text',
      hasMany: true,
      localized: true,
    },
    {
      name: 'withMinRows',
      type: 'text',
      hasMany: true,
      minRows: 2,
    },
    {
      name: 'withMaxRows',
      type: 'text',
      hasMany: true,
      maxRows: 4,
    },
    {
      name: 'disableListColumnText',
      type: 'text',
      admin: {
        disableListColumn: true,
        disableListFilter: false,
      },
    },
    {
      name: 'disableListFilterText',
      type: 'text',
      admin: {
        disableListColumn: false,
        disableListFilter: true,
      },
    },
  ],
}

export default TextFields
