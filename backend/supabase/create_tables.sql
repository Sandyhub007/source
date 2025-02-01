-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- Create the bookings table
create table if not exists bookings (
    id uuid default uuid_generate_v4() primary key,
    email text not null,
    dateTime timestamp with time zone not null,
    status text not null default 'pending',
    googleEventId text,
    createdAt timestamp with time zone default now()
);

-- Create indexes for better query performance
create index if not exists bookings_email_idx on bookings(email);
create index if not exists bookings_datetime_idx on bookings(dateTime);
create index if not exists bookings_status_idx on bookings(status);

-- Enable Row Level Security
alter table bookings enable row level security;

-- Create policies
create policy "Enable read access for all users" on bookings
    for select using (true);

create policy "Enable insert access for all users" on bookings
    for insert with check (true);

create policy "Enable update for users based on email" on bookings
    for update using (auth.email() = email);

-- Create a function to check slot availability
create or replace function is_slot_available(check_time timestamp with time zone)
returns boolean as $$
begin
    return not exists (
        select 1 from bookings
        where dateTime = check_time
        and status != 'cancelled'
    );
end;
$$ language plpgsql; 