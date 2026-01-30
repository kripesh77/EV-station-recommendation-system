# Note for this commit:

We have decided to create a separate StationStatus model as opposed to just embed it in Station model because, StationStatus contains dynamic information about the Station which often changes frequently. So querying the station all the time directly causes performance issues while the application scale. So Station contains static information of the station, which changes rarely. On the other hand, StationStatus contains the information about the Station which is dynamic, i.e. changes frequently.
