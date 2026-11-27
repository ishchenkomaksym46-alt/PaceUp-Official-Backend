type DistanceType = {
    distance: string;
    time: string;
}

export type RacesDto = {
    competitionName: string;
    distances: DistanceType[];
    date: string;
}