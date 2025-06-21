from arango.database import StandardDatabase

from data.query import GetCleandaysParams, GetCleanday, CleandayHeatmapField, HeatmapEntry
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

contains_filters = ['name', 'organization', 'organizer', 'city']

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

    if 'search_query' in params_dict and params_dict['search_query'] != "":
        all_contains = [
            f'CONTAINS(LOWER(cleanday.{contains_filter}), LOWER(@search_query))' for contains_filter in contains_filters
        ]
        filters.append(
            f"    FILTER({' OR '.join(all_contains)})"
        )
        bind_vars['search_query'] = params_dict['search_query']

    if 'address' in params_dict and params_dict['address'] != "":
        filters.append(
            f"    FILTER CONTAINS(LOWER(cleanday.location.address), LOWER(@address))"
        )
        bind_vars['address'] = params_dict['address']

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


def get_heatmap(db: StandardDatabase, x_field: CleandayHeatmapField, y_field: CleandayHeatmapField,
                    params: GetCleandaysParams) -> list[HeatmapEntry]:
    params_dict = params.model_dump(exclude_none=True)
    filters = []
    bind_vars = dict()

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

    if 'search_query' in params_dict and params_dict['search_query'] != "":
        all_contains = [
            f'CONTAINS(LOWER(cleanday.{contains_filter}), LOWER(@search_query))' for contains_filter in contains_filters
        ]
        filters.append(
            f"    FILTER({' OR '.join(all_contains)})"
        )
        bind_vars['search_query'] = params_dict['search_query']

    if 'address' in params_dict and params_dict['address'] != "":
        filters.append(
            f"    FILTER CONTAINS(LOWER(cleanday.location.address), LOWER(@address))"
        )
        bind_vars['address'] = params_dict['address']

    def unwrap(field):
        if field == "tags":
            return "tag IN u.tags"
        elif field == "requirements":
            return "req IN u.requirements"
        else:
            return None

    # AQL-safe field accessor
    def get_field_accessor(field: str) -> str:
        return f"u.{field}" if '.' not in field else '.'.join(["u"] + field.split("."))

    x_accessor = get_field_accessor(x_field)
    y_accessor = get_field_accessor(y_field)

    list_case = any(f in ["tags", "requirements"] for f in [x_field, y_field])

    if list_case:
        if x_field == "requirements":
            x_exp = "req.name"
        elif x_field == "tags":
            x_exp = "tag"
        else:
            x_exp = x_accessor

        if y_field == "requirements":
            y_exp = "req.name"
        elif y_field == "tags":
            y_exp = "tag"
        else:
            y_exp = y_accessor

        loop = ""
        if x_field == "requirements":
            loop += "FOR req IN u.requirements "
        elif x_field == "tags":
            loop += "FOR tag IN u.tags "

        if y_field == "requirements":
            loop += "FOR req IN u.requirements "
        elif y_field == "tags":
            loop += "FOR tag IN u.tags "

        query = f"""
                    LET page = (
                        FOR cl_day IN CleanDay
                            LET cdId = cl_day._id
                            LET loc = FIRST(FOR loc IN OUTBOUND cdId in_location LIMIT 1 RETURN MERGE(loc, {{key: loc._key}}))
                            LET city = FIRST(FOR city IN OUTBOUND loc in_city LIMIT 1 RETURN city)
                            LET participant_count = COUNT(FOR par IN INBOUND cdId participation_in RETURN 1)
                            LET requirements = (
                                FOR req IN OUTBOUND cdId has_requirement 
                                    LET fulfills = COUNT(FOR par IN INBOUND req fullfills RETURN 1)
                                    RETURN MERGE(req, {{"users_amount": fulfills, "key": req._key}})    
                            )
                            LET created_at = FIRST(FOR log IN INBOUND cdId relates_to_cleanday FILTER log.type == "CreateCleanday" LIMIT 1 RETURN log.date)
                            LET updated_at = NOT_NULL(FIRST(FOR log IN INBOUND cdId relates_to_cleanday FILTER log.type == "UpdateCleanday" SORT log.date DESC LIMIT 1 RETURN log.date), created_at)
                            LET organizer = FIRST(FOR par IN INBOUND cdId participation_in FILTER par.type == "Организатор" LIMIT 1 FOR user IN INBOUND par has_participation RETURN user.login)
                            LET organizer_key = FIRST(FOR par IN INBOUND cdId participation_in FILTER par.type == "Организатор" LIMIT 1 FOR user IN INBOUND par has_participation RETURN user._key)
                            LET cleanday = MERGE(cl_day, {{
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
                            RETURN cleanday
                    )
                    FOR u IN page
                        {loop}
                        COLLECT x = TO_STRING({x_exp}), y = TO_STRING({y_exp}) WITH COUNT INTO count
                        RETURN {{ x_label: x, y_label: y, count: count }}
                """
    else:
        query = f"""
                    LET page = (
                        FOR cl_day IN CleanDay
                            LET cdId = cl_day._id
                            LET loc = FIRST(FOR loc IN OUTBOUND cdId in_location LIMIT 1 RETURN MERGE(loc, {{key: loc._key}}))
                            LET city = FIRST(FOR city IN OUTBOUND loc in_city LIMIT 1 RETURN city)
                            LET participant_count = COUNT(FOR par IN INBOUND cdId participation_in RETURN 1)
                            LET requirements = (
                                FOR req IN OUTBOUND cdId has_requirement 
                                    LET fulfills = COUNT(FOR par IN INBOUND req fullfills RETURN 1)
                                    RETURN MERGE(req, {{"users_amount": fulfills, "key": req._key}})    
                            )
                            LET created_at = FIRST(FOR log IN INBOUND cdId relates_to_cleanday FILTER log.type == "CreateCleanday" LIMIT 1 RETURN log.date)
                            LET updated_at = NOT_NULL(FIRST(FOR log IN INBOUND cdId relates_to_cleanday FILTER log.type == "UpdateCleanday" SORT log.date DESC LIMIT 1 RETURN log.date), created_at)
                            LET organizer = FIRST(FOR par IN INBOUND cdId participation_in FILTER par.type == "Организатор" LIMIT 1 FOR user IN INBOUND par has_participation RETURN user.login)
                            LET organizer_key = FIRST(FOR par IN INBOUND cdId participation_in FILTER par.type == "Организатор" LIMIT 1 FOR user IN INBOUND par has_participation RETURN user._key)
                            LET cleanday = MERGE(cl_day, {{
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
                            
                            RETURN cleanday
                    )
                    FOR u IN page
                        COLLECT x = TO_STRING({x_accessor}), y = TO_STRING({y_accessor}) WITH COUNT INTO count
                        RETURN {{ x_label: x, y_label: y, count: count }}
                """

    logger.info(query)
    cursor = db.aql.execute(query, bind_vars=bind_vars)
    return [HeatmapEntry.model_validate(doc) for doc in cursor]

