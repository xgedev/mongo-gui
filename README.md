![MongoGUI](https://img.sapph.xyz/4c1fc7a9-7664-4a87-28b4-8bb2b292c700)

A simple web app to browse through and query MongoDB databases.

With user access management.

### Features
- Browse through databases, collections, and documents
- Expandable documents for better readability
- Run queries on collections including projection and limit fields
- Update queried documents by clicking on their values
- User access management
  - Add unlimited web app users (without creating database users)
  - Allow users which databases to access (only read or read/write)
  - Decide which collections to show/hide from each user
  - Limit users amount of read/write queries per 24 hours per database

![Preview](https://img.sapph.xyz/c10df53a-9aab-4367-010b-bf8a62786b00)

### Missing / TODO
- Support for inserting new documents
- Support for deleting documents
- Support for running queries like in shell (including aggregation)
- Support for other value types (apart from String, Int, Float, Boolean, Array and Object)

### Installation
0. Install bun from [bun.sh](https://bun.sh)
1. Clone repository: `git clone https://github.com/xgedev/mongo-gui`
2. Install dependencies: `bun install`
3. Build the app: `bun run build`
4. Create a `.env` file fill it with your data
5. Run the app: `HOST=localhost PORT=3000 node build`

### Update on new release
1. Pull the latest changes: `git pull`
2. Install dependencies: `bun install`
3. Build the app: `bun run build`