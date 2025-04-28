export function VerifyToken(token) {
    try {
        if (token) {
            const [datePart, timePart] = token.expires.split(', ');
            const [day, month, year] = datePart.split('/');
            const [hours, minutes, seconds] = timePart.split(':');

            // Crear una nueva instancia de Date con las partes extraídas
            const expirationDate = new Date(year, month - 1, day, hours, minutes, seconds);
            const currentDate = new Date()
            if (expirationDate < currentDate) {
                return true // en caso de que expiró
            } else {
                return false // en caso de que todavia no expira
            }
        } else {
            return true
        }
    }
    catch (error) {
        console.error(error)
    }
}