export interface User {
id: number;
name: string;
email: string;
wallet: number;
}


export interface Project {
id: number;
title: string;
description: string;
current_amount: number;
}


export interface Donation {
title: string;
amount: number;
created_at: string;
}