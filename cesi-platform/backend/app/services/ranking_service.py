from app.services.cesi_service import calculate_cesi


def rank_cities(cities):
    ranked = []

    for city in cities:
        cesi = calculate_cesi(
            city["aqi"],
            city["heat_index"],
            city["pollution_volatility"],
            city["urban_pressure"],
            city["degradation_rate"]
        )

        ranked.append({
            "name": city["name"],
            "cesi": cesi
        })

    # Sort by lowest CESI (most unstable first)
    ranked.sort(key=lambda x: x["cesi"])

    return ranked