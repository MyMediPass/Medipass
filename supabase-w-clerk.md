Clerk

Use Clerk with your Supabase project

Clerk can be used as a third-party authentication provider alongside Supabase Auth, or standalone, with your Supabase project.

Getting started#
Getting started is incredibly easy. Start off by visiting Clerk's Connect with Supabase page to configure your Clerk instance for Supabase compatibility.

Finally add a new Third-Party Auth integration with Clerk in the Supabase dashboard.

Configure for local development or self-hosting#
When developing locally or self-hosting with the Supabase CLI, add the following config to your supabase/config.toml file:

[auth.third_party.clerk]
enabled = true
domain = "example.clerk.accounts.dev"
You will still need to configure your Clerk instance for Supabase compatibility.

Manually configuring your Clerk instance#
If you are not able to use Clerk's Connect with Supabase page to configure your Clerk instance for working with Supabase, follow these steps.

Add the role claim to Clerk session tokens by customizing them. End-users who are authenticated should have the authenticated value for the claim. If you have an advanced Postgres setup where authenticated end-users use different Postgres roles to access the database, adjust the value to use the correct role name.
Once all Clerk session tokens for your instance contain the role claim, add a new Third-Party Auth integration with Clerk in the Supabase dashboard or register it in the CLI as instructed above.
Setup the Supabase client library#

TypeScript

const supabaseClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      // Session accessed from Clerk SDK, either as Clerk.session (vanilla
      // JavaScript) or useSession (React)
      accessToken: async () => session?.getToken() ?? null,
    }
  )
View source
Using RLS policies#
Once you've configured the Supabase client library to use Clerk session tokens, you can use RLS policies to secure access to your project's database, Storage objects and Realtime channels.

The recommended way to design RLS policies with Clerk is to use claims present in your Clerk session token to allow or reject access to your project's data. Check Clerk's docs on the available JWT claims and their values.

Example: Check user organization role#
create policy "Only organization admins can insert in table"
on secured_table
for insert
to authenticated
with check (
  (((select auth.jwt()->>'org_role') = 'org:admin') or ((select auth.jwt()->'o'->>'rol') = 'admin'))
    and
  (organization_id = (select coalesce(auth.jwt()->>'org_id', auth.jwt()->'o'->>'id')))
);
View source
This RLS policy checks that the newly inserted row in the table has the user's declared organization ID in the organization_id column. Additionally it ensures that they're an org:admin.

This way only organization admins can add rows to the table, for organizations they're a member of.

Example: Check user has passed second factor verification#
create policy "Only users that have passed second factor verification can read from table"
on secured_table
as restrictive
for select
to authenticated
using (
  ((select auth.jwt()->'fva'->>1) != '-1')
);
View source
This example uses a restrictive RLS policy checks that the second factor verification age element in the fva claim is not '-1' indicating the user has passed through second factor verification.

Deprecated integration with JWT templates#
As of 1st April 2025 the previously available Clerk Integration with Supabase is considered deprecated and is no longer recommended for use. All projects using the deprecated integration will be excluded from Third-Party Monthly Active User (TP-MAU) charges until at least 1st January 2026.

This integration used low-level primitives that are still available in Supabase and Clerk, such as a configurable JWT secret and JWT templates from Clerk. This enables you to keep using it in an unofficial manner, though only limited support will be provided from Supabase.

Deprecation is done for the following reasons:

Sharing your project's JWT secret with a third-party is a problematic security practice
Rotating the project's JWT secret in this case almost always results in significant downtime for your application
Additional latency to generate a new JWT for use with Supabase, instead of using the Clerk session tokens
