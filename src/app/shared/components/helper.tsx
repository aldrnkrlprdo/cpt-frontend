export const upperFirstLetter = (value: string) => {
    return String(value).charAt(0).toUpperCase() + String(value).slice(1);
}

export const formatLocalStringDateAndTime = (date: Date, format: string = 'MM/dd/yyyy') => {
    return new Date(date).toLocaleString().replace(',', '');
}

export const formatLocalStringDate = (date: Date) => {
    return new Date(date).toLocaleDateString().split('T')[0];
}