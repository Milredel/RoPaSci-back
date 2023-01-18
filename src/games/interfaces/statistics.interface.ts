export interface StatisticsByModesType {
    classic: number;
    french: number;
    star_trek: number;
}

export interface ScoreVsComputerType {
    win: number;
    lose: number;
    draw: number;
}

export interface StatisticsType {
    totalPlayedGames: number;
    playedByModes: StatisticsByModesType;
    totalPendingGames: number;
    totalScoreVsComputer: ScoreVsComputerType;
    averageTime: number;
}