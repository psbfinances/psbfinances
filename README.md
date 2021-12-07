<h1 align="center">
<div>
<img  style='border: 1px solid #B88766; border-radius: 15px' src="https://avatars.githubusercontent.com/u/95427778?s=200&v=4" width="100" height="100" alt="pbsfinances">
</div>
<div>psbFinances</div>
</h1>
<h2 align="center">
Personal and Small Businesses Financial Manager
</h2>

[psbFinances](psbfinances.com) is an open source application to manage personal and small business finances.

- [Introduction](#introduction)
  - [Purpose](#purpose)
  - [Features](#features)
  - [Who is it for?](#who-is-it-for)
  - [What it is not](#what-its-not)
- [Get started](#get-started)
  - [Requirements](#requirements)
  - [Installation steps](#installation-steps)
- [Use psbFinances](#use-psbfinances)
- [License](#license)


## Introduction

psbFinances is an open-source web application to manage personal and small business finances "under one roof". Think of it as a combination of [Mint](https://mint.intuit.com/) and [QuickBooks Self-Employed](https://quickbooks.intuit.com/self-employed/). 

![](http://psbfinances.com/uploads/psbFinances.png)

### Purpose
psbFiances allows managing personal and small business finances in a single application. Users who will get the most benefit from it are those who:

- manage their personal finances
- have small businesses, and 
- do the accounting themselves. 

Example: if you ever used your credit card to make purchase for both personal and business needs, or need to split your purchase to personal and business, then psbFinances will be a useful tool for you, especially if you have multiple businesses.

### Features

* Import transactions from multiple sources (Mint, Apple Card)
* Add transactions manually
* Categorise transaction as personal or business (assign it to a specific business)
* Add your own personal categories and use business categories as they are defined in tax return
* Split transaction to personal and business
* Track car mileages for your business taxes
* Setup detailed budget for each month/year
* Schedule future transactions and reconcile them when you have bank statement
* View projected cash flow
* Use comprehensive dashboard to monitor personal and business financial health 
* Let multiple users to use the application
* Track all the changes that were made by users (who, what, when)
* Create followup task for transaction and assign it to a specific user
* Attach copies of receipts or other documents to transactions
* Create rules for imported data to automatically assign to specific categories and/or businesses.

### Who is it for?
This application is primarily for those who:

* manage their personal finances
* have at least one small business
* does their own accounting and want to keep it simple

### What it's not

psbFinances is not a tool:

* to automatically download your financial data from multiple institutes (data scraping)
* to have a complex financial accounting (General Ledger, Chart of Accounts)

## Get started

### Requirements

To run psbFinances you will need a server with:

- [Node.js](https://nodejs.org/en/) 16.0 or newer
- [npm](https://www.npmjs.com)
- [MySQL](https://dev.mysql.com/downloads/mysql/)
- [rsync](https://en.wikipedia.org/wiki/Rsync)

### Installation steps

#### 1. Clone the repository

Clone psbFinances repository and install dependencies:

```shell
git clone https://github.com/pbsfinances/psbfinances.git psbfiannces
cd psbfiances
npm i
```

#### 2. Setup the database

Log in with the root account to configure the database.

```sh
mysql -u root -p
```

Create a database called 'psbf'.

```sql
CREATE DATABASE psbf CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Create a user called 'psbf' and its password 'strong-password'.

```sql
CREATE USER 'psbf'@'localhost' IDENTIFIED BY 'strong-password';
```

Authorize the new user on the `psbf` database so that user is allowed to change the database.

```sql
GRANT ALTER, CREATE, INDEX, DELETE, INSERT, UPDATE, SELECT ON psbf.* TO 'psbf'@'localhost';
```

Apply the changes and exit the database.

```sql
FLUSH PRIVILEGES;
exit
```

#### 3. Configure the application

Copy development configuration file `server/config/config._dev.yaml` to `server/config/config.dev.yaml`. 

Generate JWT secret that is required for user authentication. There are many ways to do that, check [this Q&A from StackOverflow](https://stackoverflow.com/questions/52996555/generate-a-sufficient-secret-for-jwt-nodejs-lambda).

Update `server/config/config.dev.yaml` file with database settings and JWT secret.

#### 4. Run the application

Run the server:
```shell
npm run start:server
```

Run frontend with [webpack](https://webpack.js.org) development server:
```shell
npm run start:web
```

## Use psbFinances

### 1. Launch the application

Open browser and navigate to `localhost:9001`.

### 2. Create first user account

On the home screen click `[Sign Up]` button, enter an email and password, and click `[Sign Up]`.

### 3. Add data

#### 3.1 Manual setup

Start by navigating to `Settings` and add at least:
- Account
- Business
- Categories (psbFiances add categories for business transactions automatically)

Go to `Transactons` and add a transaction manually by clicking `[+]`.

#### 3.2. Mint import
Another option is to import transactions from [Mint](https://mint.intuit.com/):
- Download Mint transactions ([see help](https://help.mint.com/Accounts-and-Transactions/888960591/How-can-I-download-my-transactions.htm))
- Navigate to `Settings`, `Imports`
- Select downloaded file with transactions
- Select `Mint` as a format, and click `[Import]`

This will import transactions and create accounts and categories. The table will show information about the imported file. Please note that you can undo the import by clicking [Undo](#) link, but this link is available for a short period of time after import.

### 4. Final step

And now have Fun.

## License

Copyright © 2020–2021

psbFinances is open-source under the GNU Affero General Public License Version 3 (AGPLv3). Check it [here](/LICENSE.md).
