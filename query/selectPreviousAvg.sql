select 
  avg_gain, 
  avg_loss 
from rsi 
where 
  period=:period
  and avg_gain is not null
  and avg_loss is not null
order by id desc 
limit 1