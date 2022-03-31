import React from 'react'

import { Meta, Story } from '@storybook/react'
import { DataFilter, DataFilterProps } from '../data/components/filter/DataFilter'
import { Filter, MillisNone } from '../data/filtering'

const STRING_FILTER: Filter<'string'> = {
  type: 'string',
  column: {
    name: 'COL_1',
    type: 'string',
    index: 0,
  },
  value: {
    text: '',
  },
}

const NUMBER_FILTER: Filter<'number'> = {
  type: 'number',
  column: {
    name: 'COL_2',
    type: 'number',
    index: 1,
  },
  value: {
    from: 0,
    to: 100,
  },
}

const BOOLEAN_FILTER: Filter<'boolean'> = {
  type: 'boolean',
  column: {
    name: 'COL_3',
    type: 'boolean',
    index: 2,
  },
  value: {
    isTrue: true,
  },
}

const DATE_FILTER: Filter<'date'> = {
  type: 'date',
  column: {
    name: 'COL_4',
    type: 'date',
    index: 3,
  },
  value: {
    millisFrom: MillisNone,
    millisTo: MillisNone,
  },
}

const TIMESTAMP_FILTER: Filter<'timestamp'> = {
  type: 'timestamp',
  column: {
    name: 'COL_5',
    type: 'timestamp',
    index: 4,
  },
  value: {
    millisFrom: MillisNone,
    millisTo: MillisNone,
  },
}

export default {
  title: 'Filters',
  component: DataFilter,
} as Meta

const Template: Story<DataFilterProps<any>> = (args) => <DataFilter {...args} />

export const TextFilter = Template.bind({})
TextFilter.args = {
  column: STRING_FILTER.column,
  type: STRING_FILTER.type,
  filter: STRING_FILTER,
}

export const NumberFilter = Template.bind({})
NumberFilter.args = {
  column: NUMBER_FILTER.column,
  type: NUMBER_FILTER.type,
  filter: NUMBER_FILTER,
}

export const BooleanFilter = Template.bind({})
BooleanFilter.args = {
  column: BOOLEAN_FILTER.column,
  type: BOOLEAN_FILTER.type,
  filter: BOOLEAN_FILTER,
}

export const DateFilter = Template.bind({})
DateFilter.args = {
  column: DATE_FILTER.column,
  type: DATE_FILTER.type,
  filter: DATE_FILTER,
}

export const TimestampFilter = Template.bind({})
TimestampFilter.args = {
  column: TIMESTAMP_FILTER.column,
  type: TIMESTAMP_FILTER.type,
  filter: TIMESTAMP_FILTER,
}
