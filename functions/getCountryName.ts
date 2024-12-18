import { promises as fs } from 'fs';
export const getCountryName = async (code: string): Promise <string> => {
    try {
        const countries = await fs.readFile(process.cwd() + '/jsons/countries.json', 'utf8')
        const data = JSON.parse(countries)
        // console.log(data);
        
        return data[code].country;
    } catch (error) {
        console.error("Error fetching user country:", error);
        return '';
    }
};
