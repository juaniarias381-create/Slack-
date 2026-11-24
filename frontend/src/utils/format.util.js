/*
Helpers de formato compartidos por la pantalla de workspace.
*/

export function pluralize(count, singular, plural) {
    const safe_count = Number.isFinite(count) ? count : 0
    return `${safe_count} ${safe_count === 1 ? singular : plural}`
}

export function formatDate(value) {
    if (!value) {
        return '—'
    }

    const date = new Date(value)

    if (Number.isNaN(date.getTime())) {
        return '—'
    }

    return new Intl.DateTimeFormat(
        'es-AR',
        {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        }
    ).format(date)
}

export function formatDateTime(value) {
    if (!value) {
        return ''
    }

    const date = new Date(value)

    if (Number.isNaN(date.getTime())) {
        return ''
    }

    return new Intl.DateTimeFormat(
        'es-AR',
        {
            dateStyle: 'short',
            timeStyle: 'short'
        }
    ).format(date)
}

export function getInitial(value) {
    return value?.trim()?.charAt(0)?.toUpperCase() || '?'
}

/*
Devuelve un tono estable (0 a 3) a partir de un id o nombre.
Asi el color del avatar no cambia cuando se agrega otro miembro.
*/
export function getAvatarTone(value = '') {
    const text = String(value)

    let sum = 0

    for (let index = 0; index < text.length; index += 1) {
        sum += text.charCodeAt(index)
    }

    return sum % 4
}
