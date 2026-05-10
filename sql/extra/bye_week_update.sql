 UPDATE player
  SET bye_week = CASE nfl_team
      WHEN 'ARI' THEN 6
      WHEN 'MIA' THEN 6
      WHEN 'NO'  THEN 6
      WHEN 'PIT' THEN 6
      WHEN 'CHI' THEN 7
      WHEN 'CLE' THEN 7
      WHEN 'LAC' THEN 7
      WHEN 'TB'  THEN 7
      WHEN 'ATL' THEN 8
      WHEN 'CAR' THEN 8
      WHEN 'DEN' THEN 8
      WHEN 'LV'  THEN 8
      WHEN 'BUF' THEN 9
      WHEN 'DAL' THEN 9
      WHEN 'KC'  THEN 9
      WHEN 'NYG' THEN 9
      WHEN 'BAL' THEN 10
      WHEN 'HOU' THEN 10
      WHEN 'IND' THEN 10
      WHEN 'SEA' THEN 10
      WHEN 'CIN' THEN 11
      WHEN 'GB'  THEN 11
      WHEN 'PHI' THEN 11
      WHEN 'TEN' THEN 11
      WHEN 'DET' THEN 12
      WHEN 'MIN' THEN 12
      WHEN 'NYJ' THEN 12
      WHEN 'SF'  THEN 12
      WHEN 'JAX' THEN 13
      WHEN 'LAR' THEN 13
      WHEN 'NE'  THEN 13
      WHEN 'WAS' THEN 13
      ELSE 0
  END;