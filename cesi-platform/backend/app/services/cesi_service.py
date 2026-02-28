def calculate_cesi(aqi, heat_index, pollution_volatility, urban_pressure, degradation_rate):
    """
    CESI Score Formula (Hackathon MVP Version)
    Score range: 0 - 100
    Higher = More Stable
    """

    risk_score = (
        0.35 * aqi +
        0.25 * heat_index +
        0.15 * pollution_volatility +
        0.15 * urban_pressure +
        0.10 * degradation_rate
    )

    cesi = max(0, 100 - risk_score)
    return round(cesi, 2)