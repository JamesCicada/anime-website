export const isBanned = async (): Promise<string> => {
    try {
        // Fetch the user's IP address
        const ipResponse = await fetch("https://api.ipify.org?format=json");
        const { ip } = await ipResponse.json();

        // Fetch the user's country based on the IP address
        const countryResponse = await fetch(`https://ipapi.co/${ip}/country/`);
        const country = await countryResponse.text();

        // Check if the country is in the banned list
        return country;
    } catch (error) {
        console.error("Error fetching user country:", error);
        return ''; // Default to not banned in case of an error
    }
};
