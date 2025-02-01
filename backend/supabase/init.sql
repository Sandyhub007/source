-- Create the bookings table
create table bookings (
    id uuid default uuid_generate_v4() primary key,
    email text not null,
    dateTime timestamp with time zone not null,
    status text not null default 'pending',
    googleEventId text,
    createdAt timestamp with time zone default now()
);

-- Create indexes for better query performance
create index bookings_email_idx on bookings(email);
create index bookings_datetime_idx on bookings(dateTime);
create index bookings_status_idx on bookings(status);

-- Create Row Level Security policies
alter table bookings enable row level security;

-- Allow anyone to create a booking
create policy "Anyone can create a booking"
on bookings for insert
to anon
with check (true);

-- Allow reading own bookings
create policy "Users can view own bookings"
on bookings for select
to anon
using (email = auth.jwt() ->> 'email');

-- Allow cancelling own bookings
create policy "Users can cancel own bookings"
on bookings for update
to anon
using (email = auth.jwt() ->> 'email'); 