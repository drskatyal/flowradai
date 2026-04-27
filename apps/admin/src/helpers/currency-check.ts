export const checkCurrency = (ammount: number) => {
    switch (ammount) {
        case 10:
        case 35:
        case 70:
        case 120:
        case 59:
        case 600:
        case 25:
            return `$${ammount}`;
        case 800:
        case 2800:
        case 3000:
        case 6000:
        case 10000:
        case 4500:
        case 944:
        case 3304:
        case 5310:
        case 49000:
        case 57820:
        case 2500:
        case 40020:
        case 22000:
        case 33000:
            return `₹${ammount}`
        default:
            break;
    }
}