type FormAnswer = {
  textValue?: string | null
  jsonValue?: string | null
  fileUrl?: string | null
  fileName?: string | null
}

/** Converts stored dynamic form values to a non-lossy Excel cell value. */
export function formatSessionFormAnswer(answer?: FormAnswer | null) {
  if (!answer) return ''
  if (answer.textValue != null) return answer.textValue

  if (answer.jsonValue) {
    try {
      const value = JSON.parse(answer.jsonValue)
      return Array.isArray(value) ? value.join(', ') : JSON.stringify(value)
    } catch {
      return answer.jsonValue
    }
  }

  if (answer.fileUrl) {
    return answer.fileName ? `${answer.fileName} (${answer.fileUrl})` : answer.fileUrl
  }

  return ''
}

export function exportFilePart(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80) || 'Session'
}
