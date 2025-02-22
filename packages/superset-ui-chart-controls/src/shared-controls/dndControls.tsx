/* eslint-disable camelcase */
/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
import { Metric, t, validateNonEmpty } from '@superset-ui/core';
import { ExtraControlProps, SharedControlConfig } from '../types';
import { mainMetric } from '../utils';
import { TIME_COLUMN_OPTION } from '../constants';

type Control = {
  savedMetrics?: Metric[] | null;
  default?: unknown;
};

export const dndGroupByControl: SharedControlConfig<'DndColumnSelect'> = {
  type: 'DndColumnSelect',
  label: t('Group by'),
  default: [],
  description: t('One or many columns to group by'),
  mapStateToProps(state, { includeTime }) {
    const newState: ExtraControlProps = {};
    if (state.datasource) {
      const options = state.datasource.columns.filter(c => c.groupby);
      if (includeTime) {
        options.unshift(TIME_COLUMN_OPTION);
      }
      newState.options = Object.fromEntries(options.map(option => [option.column_name, option]));
    }
    return newState;
  },
};

export const dndColumnsControl: typeof dndGroupByControl = {
  ...dndGroupByControl,
  label: t('Columns'),
  description: t('One or many columns to pivot as columns'),
};

export const dndSeries: typeof dndGroupByControl = {
  ...dndGroupByControl,
  label: t('Series'),
  multi: false,
  default: null,
  description: t(
    'Defines the grouping of entities. ' +
      'Each series is shown as a specific color on the chart and ' +
      'has a legend toggle',
  ),
};

export const dndEntity: typeof dndGroupByControl = {
  ...dndGroupByControl,
  label: t('Entity'),
  default: null,
  multi: false,
  validators: [validateNonEmpty],
  description: t('This defines the element to be plotted on the chart'),
};

export const dnd_adhoc_filters: SharedControlConfig<'DndFilterSelect'> = {
  type: 'DndFilterSelect',
  label: t('Filters'),
  default: null,
  description: '',
  mapStateToProps: ({ datasource, form_data }) => ({
    columns: datasource?.columns.filter(c => c.filterable) || [],
    savedMetrics: datasource?.metrics || [],
    // current active adhoc metrics
    selectedMetrics: form_data.metrics || (form_data.metric ? [form_data.metric] : []),
    datasource,
  }),
  provideFormDataToProps: true,
};

export const dnd_adhoc_metrics: SharedControlConfig<'DndMetricSelect'> = {
  type: 'DndMetricSelect',
  multi: true,
  label: t('Metrics'),
  validators: [validateNonEmpty],
  default: (c: Control) => {
    const metric = mainMetric(c.savedMetrics);
    return metric ? [metric] : null;
  },
  mapStateToProps: ({ datasource }) => ({
    columns: datasource ? datasource.columns : [],
    savedMetrics: datasource ? datasource.metrics : [],
    datasourceType: datasource?.type,
  }),
  description: t('One or many metrics to display'),
};

export const dnd_adhoc_metric: SharedControlConfig<'DndMetricSelect'> = {
  ...dnd_adhoc_metrics,
  multi: false,
  label: t('Metric'),
  description: t('Metric'),
  default: (c: Control) => mainMetric(c.savedMetrics),
};
