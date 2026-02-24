const {pgTable, uuid, varchar, text, timestamp, pgEnum} = require("drizzle-orm/pg-core")

const userRoleEnum = pgEnum('user_roles', ['ADMIN', 'MODERATOR', 'USER'])

const userTable = pgTable('users', ({
    id: uuid('user_id').primaryKey().defaultRandom(),

    firstName: varchar('user_name', {length: 55}).notNull(),
    lastName: varchar('last_name', {length: 55}),

    email: varchar('user_email', {length: 255}).notNull().unique(),

    role: userRoleEnum('user_role').default('USER').notNull(),

    password: text('user_password').notNull(),
    salt: text('user_salt').notNull(),

    createAt: timestamp('create_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').$onUpdate(() => new Date()).notNull()

}))

const userSessions = pgTable('user sessions', ({
    id: uuid('user_session_id').primaryKey().defaultRandom(),

    userId: uuid('user_id').references(() => userTable.id).notNull(),

    startTime: timestamp('sesssion_started_at').defaultNow().notNull(),
    endTime: timestamp('session_ended_at')
}))


module.exports = {
    userRoleEnum,
    userTable,
    userSessions
}