export enum CronExecutionStatus {
  success = 'sucesso',
  partial = 'parcial',
  error = 'erro',
}

export const cronExecutionStatusDictionary = {
  [CronExecutionStatus.success]: 'enums.cron_execution_status.success',
  [CronExecutionStatus.partial]: 'enums.cron_execution_status.partial',
  [CronExecutionStatus.error]: 'enums.cron_execution_status.error',
} as const satisfies Record<CronExecutionStatus, string>;
