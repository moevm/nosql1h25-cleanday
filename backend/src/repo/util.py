from arango.database import StandardDatabase

from data.query import GetCleandaysParams, GetCleanday

contains_filters = ['name', 'organization', 'organizer']

from_filters = ['begin_date_from', 'end_date_from', 'area_from', 'recommended_count_from', 'participant_count_from',
                'created_at_from', 'updated_at_from']
to_filters = ['begin_date_to', 'end_date_to', 'area_to', 'recommended_count_to', 'participant_count_to',
              'created_at_to', 'updated_at_to']

time_fields = ['begin_date', 'end_date', 'created_at', 'updated_at']


def get_cleanday_page(db: StandardDatabase, header_query: str, params: GetCleandaysParams, **kwargs) -> (int, list[GetCleanday]):
    params_dict = params.model_dump(exclude_none=True)
    filters = []
    bind_vars = {
        "offset": params.offset,
        "limit": params.limit
    }
    bind_vars.update(kwargs)

    for contains_filter in contains_filters:
        if contains_filter in params_dict:
            filters.append(
                f"    FILTER CONTAINS(LOWER(cleanday.{contains_filter}), LOWER(@{contains_filter}))"
            )
            bind_vars[contains_filter] = params_dict[contains_filter]

    if "status" in params_dict:
        filters.append("    FILTER cleanday.status IN @status")
        bind_vars["status"] = params_dict["status"]

    if "tags" in params_dict:
        filters.append("    FILTER cleanday.tags ANY IN @tags")
        bind_vars["tags"] = params_dict["tags"]

    for from_filter in from_filters:
        if from_filter in params_dict:
            field_name = from_filter[:-5]
            filters.append(
                f"    FILTER cleanday.{field_name} >= @{from_filter}"
            )
            bind_vars[from_filter] = params_dict[from_filter]
            if field_name in time_fields:
                bind_vars[from_filter] = bind_vars[from_filter].isoformat()

    for to_filter in to_filters:
        if to_filter in params_dict:
            field_name = to_filter[:-3]
            filters.append(
                f"    FILTER cleanday.{field_name} <= @{to_filter}"
            )
            bind_vars[to_filter] = params_dict[to_filter]
            if field_name in time_fields:
                bind_vars[to_filter] = bind_vars[to_filter].isoformat()

    query = f"""
        LET count = COUNT(
            {header_query}
                LET cdId = cl_day._id     
                LET loc = FIRST(
                    FOR loc IN OUTBOUND cdId in_location
                        LIMIT 1
                        RETURN MERGE(loc, {{key: loc._key}})
                )

                LET city = FIRST(
                    FOR city IN OUTBOUND loc in_city
                      LIMIT 1
                      RETURN city
                )

                LET participant_count = COUNT(
                    FOR par IN INBOUND cdId participation_in
                      FOR user IN INBOUND par has_participation
                        LIMIT 1
                        RETURN 1
                )

                LET requirements = (
                    FOR req IN OUTBOUND cdId has_requirement 
                        LET fulfills = COUNT(
                            FOR par IN INBOUND req fullfills
                                RETURN 1
                        )

                        RETURN MERGE(req, {{"users_amount": fulfills, "key": req._key}})    
                )
                LET created_at = FIRST(
                    FOR log IN INBOUND cdId relates_to_cleanday
                        FILTER log.type == "CreateCleanday"
                        LIMIT 1
                        RETURN log.date
                )

                LET updated_at = NOT_NULL(FIRST(
                    FOR log IN INBOUND cdId relates_to_cleanday
                        FILTER log.type == "UpdateCleanday"
                        SORT log.date DESC
                        LIMIT 1
                        RETURN log.date
                ), created_at)

                LET organizer = FIRST(
                    FOR par IN INBOUND cdId participation_in
                        FILTER par.type == "Организатор"
                        LIMIT 1
                        FOR user IN INBOUND par has_participation
                            RETURN user.login
                )

                LET organizer_key = FIRST(
                    FOR par IN INBOUND cdId participation_in
                        FILTER par.type == "Организатор"
                        LIMIT 1
                        FOR user IN INBOUND par has_participation
                            RETURN user._key
                )

                LET cleanday = MERGE(cl_day,
                {{
                    "key": cl_day._key,
                    "city": city.name,
                    "participant_count": participant_count,
                    "requirements": requirements,
                    "location": loc,
                    "created_at": created_at,
                    "updated_at": updated_at,
                    "organizer": organizer,
                    "organizer_key": organizer_key,
                }})

            {'\n'.join(filters)}

                RETURN cleanday
        )

        LET page = (
             {header_query}
                LET cdId = cl_day._id     
                LET loc = FIRST(
                    FOR loc IN OUTBOUND cdId in_location
                        LIMIT 1
                        RETURN MERGE(loc, {{key: loc._key}})
                )

                LET city = FIRST(
                    FOR city IN OUTBOUND loc in_city
                      LIMIT 1
                      RETURN city
                )

                LET participant_count = COUNT(
                    FOR par IN INBOUND cdId participation_in
                      FOR user IN INBOUND par has_participation
                        LIMIT 1
                        RETURN 1
                )

                LET requirements = (
                    FOR req IN OUTBOUND cdId has_requirement 
                        LET fulfills = COUNT(
                            FOR par IN INBOUND req fullfills
                                RETURN 1
                        )

                        RETURN MERGE(req, {{"users_amount": fulfills, "key": req._key}})    
                )

                LET created_at = FIRST(
                    FOR log IN INBOUND cdId relates_to_cleanday
                        FILTER log.type == "CreateCleanday"
                        LIMIT 1
                        RETURN log.date
                )

                LET updated_at = NOT_NULL(FIRST(
                    FOR log IN INBOUND cdId relates_to_cleanday
                        FILTER log.type == "UpdateCleanday"
                        SORT log.date DESC
                        LIMIT 1
                        RETURN log.date
                ), created_at)

                LET organizer = FIRST(
                    FOR par IN INBOUND cdId participation_in
                        FILTER par.type == "Организатор"
                        LIMIT 1
                        FOR user IN INBOUND par has_participation
                            RETURN user.login
                )

                LET organizer_key = FIRST(
                    FOR par IN INBOUND cdId participation_in
                        FILTER par.type == "Организатор"
                        LIMIT 1
                        FOR user IN INBOUND par has_participation
                            RETURN user._key
                )

                LET cleanday = MERGE(cl_day,
                {{
                    "key": cl_day._key,
                    "city": city.name,
                    "participant_count": participant_count,
                    "requirements": requirements,
                    "location": loc,
                    "created_at": created_at,
                    "updated_at": updated_at,
                    "organizer": organizer,
                    "organizer_key": organizer_key
                }})

            {'\n'.join(filters)}

                SORT cleanday.{params.sort_by} {params.sort_order}
                LIMIT @offset, @limit

                RETURN cleanday           
        )

        RETURN {{
                "page": page,
                "count": count
                }}
        """

    print(query)

    cursor = db.aql.execute(query, bind_vars=bind_vars)
    result_dict = cursor.next()

    cleanday_page = list(map(lambda c: GetCleanday.model_validate(c), result_dict["page"]))

    return result_dict["count"], cleanday_page
