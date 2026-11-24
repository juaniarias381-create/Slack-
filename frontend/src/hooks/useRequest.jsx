import { useCallback, useState } from 'react'

/*
Este hook maneja los 3 estados de cualquier pedido: cargando / respuesta /
error.

Analogia: es el portero del edificio. Recibe una funcion que hace el pedido,
prende el cartel "cargando", guarda la respuesta o el error, y siempre apaga
el cartel al final.

sendRequest devuelve la respuesta cuando sale bien, para que quien llama
pueda decidir que hacer (por ejemplo, limpiar un formulario).
*/
function useRequest() {
    const [loading, set_loading] = useState(false)
    const [response, set_response] = useState(null)
    const [error, set_error] = useState(null)

    const sendRequest = useCallback(
        async (requestFn) => {
            try {
                set_loading(true)
                const result = await requestFn()
                set_response(result)
                set_error(null)
                return result
            } catch (error) {
                set_response(null)
                set_error(error.message)
                return null
            } finally {
                set_loading(false)
            }
        },
        []
    )

    const reset = useCallback(
        () => {
            set_loading(false)
            set_response(null)
            set_error(null)
        },
        []
    )

    return {
        loading,
        response,
        error,
        sendRequest,
        reset
    }
}

export default useRequest
