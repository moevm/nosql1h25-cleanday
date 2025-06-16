from arango.database import StandardDatabase

from repo.model import RepoStats


class StatRepo:

    def __init__(self, database: StandardDatabase):
        self.db = database

    def get_stats(self) -> RepoStats:
        cursor = self.db.aql.execute(
            """
            LET user_count = COUNT(
                FOR u in User
                    RETURN 1
            )
            
            LET participated_user_count = COUNT(
                FOR u in User
                    LET par_count = COUNT(
                        FOR par IN OUTBOUND u has_participation
                            RETURN 1
                    )
                    FILTER par_count > 0
                    RETURN 1
            )
            
            LET cleanday_count = COUNT(
                FOR cl_day in CleanDay
                    RETURN 1
            )
            
            LET past_cleanday_count = COUNT(
                FOR cl_day in CleanDay
                    FILTER cl_day.status == "Завершен"
                    RETURN 1
            )
            
            LET cleanday_metric = SUM(
                FOR cl_day in CleanDay
                    FILTER cl_day.status == "Завершен"
                    RETURN cl_day.area
            )
            
            RETURN {
                user_count: user_count,
                participated_user_count: participated_user_count,
                cleanday_count: cleanday_count,
                past_cleanday_count: past_cleanday_count,
                cleanday_metric: cleanday_metric
            }
            """
        )

        res_dict = cursor.next()

        return RepoStats.model_validate(res_dict)
