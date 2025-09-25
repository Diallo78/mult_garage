import { GarageDtoModel } from "../../models/garage-dto.model";


export class GarageDtoFunction {

    static garageDto(): GarageDtoModel | null {
        const storedGarage = localStorage.getItem('garageInfo');
        if (storedGarage) {
            const garageInfo = JSON.parse(storedGarage) as GarageDtoModel;
            console.log('Garage récupéré depuis localStorage:', garageInfo);
            return garageInfo;
        }
        return null; // si rien trouvé
    }

}
