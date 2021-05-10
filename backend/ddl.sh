# Create instance in local cloud spanner emulator 

gcloud spanner instances create omegatrade-instance --config=emulator-config \
--description="OmegaTrade Instance - Cloud Spanner Emulator" --nodes=1

# Create a database in emulator

gcloud spanner databases create omegatrade-db --instance omegatrade-instance

# Create users table

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

# Create companies table

gcloud spanner databases ddl update omegatrade-db --instance omegatrade-instance --ddl  \
"CREATE TABLE companies 
(companyId STRING(36) NOT NULL,
companyName STRING(30),
companyShortCode STRING(15),
created_at TIMESTAMP NOT NULL OPTIONS (allow_commit_timestamp=true)) PRIMARY KEY(companyId);"

gcloud spanner databases ddl update omegatrade-db --instance omegatrade-instance --ddl  \
"CREATE UNIQUE NULL_FILTERED INDEX companiesByCompanyName ON companies (companyName);
CREATE UNIQUE NULL_FILTERED INDEX companiesByShortCode ON companies (companyShortCode);"

# Create CompanyStocks table

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
PRIMARY KEY(companyStockId)"


# Create simulations table

gcloud spanner databases ddl update omegatrade-db --instance omegatrade-instance --ddl \
"CREATE TABLE simulations (
sId STRING(36) NOT NULL,
companyId STRING(36) NOT NULL,
status STRING(36),
createdAt TIMESTAMP NOT NULL OPTIONS (allow_commit_timestamp=true),
CONSTRAINT FK_CompanySimulation FOREIGN KEY (companyId) REFERENCES companies (companyId)
) PRIMARY KEY(sId)"

