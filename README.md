# Omega Trade App

Sample application for [Spanner Terraform Example](https://github.com/cloudspannerecosystem/spanner-terraform-example).  
This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 11.0.0 and [Express](https://github.com/expressjs/express/blob/master/Readme.md) (Node.js web application framework) version 4.17.0.

## Dependencies
* Cloud Spanner - [Emulator](https://cloud.google.com/spanner/docs/emulator)
* Cloud Spanner - [Node.js Client](https://www.npmjs.com/package/@google-cloud/spanner)

## Development server

#### Starting the Emulator Locally 

There are various options to start the emulator locally. Here we will cover the gcloud instructions. Although all other methods can be found within the Cloud Spanner Emulator [GitHub repository](https://github.com/GoogleCloudPlatform/cloud-spanner-emulator/blob/master/README.md#quickstart). 

Via gcloud commands

```
gcloud components update 
gcloud emulators spanner start 
```

Let’s create a configuration for the emulator. This is a one-time setup and can be reused subsequently. Run following commands

```
gcloud config configurations create emulator
gcloud config set auth/disable_credentials true
gcloud config set project test-project
gcloud config set api_endpoint_overrides/spanner http://localhost:9020/
```

In your development environment, you might want to switch between using a local emulator or connecting to a production Cloud Spanner instance. You can manage this by having multiple gcloud configurations and switching between configurations by using the following command


```

gcloud config configurations activate default

# Or switch to the emulator configuration
gcloud config configurations activate emulator

# verify it is actually connected to the emulator
gcloud config list

```

Let’s create an instance, database and some tables on the local emulator. 

#### Create an instance in the emulator 

```

gcloud spanner instances create omegatrade-instance --config=emulator-config \
--description="OmegaTrade Instance - Cloud Spanner Emulator" --nodes=3

```

#### Create a database

```

gcloud spanner databases create omegatrade-db --instance omegatrade-instance

```

#### Create Tables 

```

gcloud spanner databases ddl update omegatrade-db --instance omegatrade-instance --ddl \
"CREATE TABLE users 
(userId STRING(36) NOT NULL,
businessEmail STRING(50),
fullName STRING(36),
password STRING(100),
photoUrl STRING(250),
provider STRING(20),
forceChangePassword BOOL) PRIMARY KEY(userId);
CREATE UNIQUE NULL_FILTERED INDEX usersByBusinessEmail ON users (businessEmail);"


gcloud spanner databases ddl update omegatrade-db --instance omegatrade-instance --ddl  \
"CREATE TABLE companies 
(companyId STRING(36) NOT NULL,
companyName STRING(30),
companyShortCode STRING(15),
created_at TIMESTAMP NOT NULL OPTIONS (allow_commit_timestamp=true)) PRIMARY KEY(companyId);"

gcloud spanner databases ddl update omegatrade-db --instance omegatrade-instance --ddl  \
"CREATE UNIQUE NULL_FILTERED INDEX companiesByCompanyName ON companies (companyName);
CREATE UNIQUE NULL_FILTERED INDEX companiesByShortCode ON companies (companyShortCode);"

gcloud spanner databases ddl update omegatrade-db --instance omegatrade-instance --ddl \
"CREATE TABLE companyStocks (
companyStockId STRING(36) NOT NULL,
companyId STRING(36) NOT NULL,
open NUMERIC,
volume NUMERIC,
currentValue NUMERIC,
date FLOAT64,
close NUMERIC,
dayHigh NUMERIC,
dayLow NUMERIC,
timestamp TIMESTAMP NOT NULL OPTIONS (allow_commit_timestamp=true),
CONSTRAINT FK_CompanyStocks FOREIGN KEY (companyId) REFERENCES companies (companyId)) 
PRIMARY KEY(companyStockId);"

gcloud spanner databases ddl update omegatrade-db --instance omegatrade-instance --ddl \
"CREATE TABLE simulations (
sId STRING(36) NOT NULL,
companyId STRING(36) NOT NULL,
status STRING(36),
createdAt TIMESTAMP NOT NULL OPTIONS (allow_commit_timestamp=true),
CONSTRAINT FK_CompanySimulation FOREIGN KEY (companyId) REFERENCES companies (companyId)
) PRIMARY KEY(sId);"

```

Verify if these tables were successfully created by querying **INFORMATION_SCHEMA** in the emulator instance.

```

gcloud spanner databases execute-sql omegatrade-db  --instance=omegatrade-instance  --sql='SELECT * FROM information_schema.tables WHERE table_schema <> "INFORMATION_SCHEMA"'

```

Now the emulator is up and running, let’s clone this repo and run the backend service of OmegaTrade with the emulator. 

```

cd backend

#Install Dependencies
npm install 

#create logs folder and assign permissions
mkdir logs && sudo chmod 777 logs  

```

Verify .env file and ensure the **project id, instance name and database** name match the once we created above. 

```

PROJECTID = test-project
INSTANCE = omegatrade-instance
DATABASE = omegatrade-db
JWT_KEY = w54p3Y?4dj%8Xqa2jjVC84narhe5Pk
EXPIRE_IN = 2d

```

```
npm install
export SPANNER_EMULATOR_HOST="localhost:9010"
node server.js
```

The above command will run the Backend Service in `http://localhost:3000/`

let’s run the **frontend** service of OmegaTrade.

```
cd frontend

#Install Dependencies
npm install 

```

#### Creating Google Oauth Credentials

You can follow the [official guide](https://support.google.com/cloud/answer/6158849?hl=en#zippy=) for setting up Oauth.

```

Step 1: Go to the [Google API Console Credentials](https://console.developers.google.com/apis/credentials). Click on Create Credentials and choose OAuth client ID. 

step 2: In application type, choose Web application and name whatever you like. Click create to continue.   

step 3: Note down your client ID as you need to configure this in the frontend. 

```

The client id looks like this 142706365772-ol2a8hcqs1d3rrgjgvxxxxxxxxdqpog8.apps.googleusercontent.com

Now lets configure client id and backend API url.

```

cd src/environments
vi environment.ts

```

Change the **base URL** according to the **backend URL** (keep the /api/v1 as it is) and clientId.

```

export const environment = {
  production: false,
  name: "dev",
  // change baseUrl according to backend URL
  baseUrl: "http://localhost:3000/api/v1/", 
  // change clientId to actual value you have received from Oauth console
  clientId: "142706365772-ol2a8hcqs1d3rrgjgvxxxxxxxxdqpog8.apps.googleusercontent.com"
};


```

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.
