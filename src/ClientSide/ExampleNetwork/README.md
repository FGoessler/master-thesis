## Example Network

This network contains 3 services:

- RandomNrService: Creates a random number.
- PersistenceService: "Fake" stores a number.
- PublicService: Uses the other two services to get a random number, stores it and returns it to the user.

You can use the following endpoints:

- localhost:8003/action : Performs a request that leverages the other 2 services.
- localhost:8003/terminate : Terminates the mediators to both services.


- localhost:8001/redeem : Redeems the current token used to communicate with the PersistenceService.
- localhost:8001/terminate : Terminates the mediator between the PublicService and the PersistenceService


- localhost:8002/redeem : Redeems the current token used to communicate with the RandomNumberService.
- localhost:8002/terminate : Terminates the mediator between the PublicService and the RandomNumberService


To launch the the services without payment server requirements set the environment variable "PAYMENT_INACTIVE".
