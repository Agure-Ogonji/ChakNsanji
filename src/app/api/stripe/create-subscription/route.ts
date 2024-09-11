import { db } from "@/lib/db"
import { stripe } from "@/lib/stripe"
import { NextResponse } from "next/server"

export async function POST(req: Request){
    const {customerId, priceId} = await req.json()
    if(!customerId || !priceId)
        return new NextResponse('Customer ID or Price ID is Missing',{
            status: 400,
        })

    const subscriptionExists = await db.agency.findFirst({
        where: {customerId},
        include: {Subscription: true},
    })

    try {
        if(subscriptionExists?.Subscription?.subscriptionId && subscriptionExists.Subscription.active){
            if(!subscriptionExists.Subscription.subscriptionId){
                throw new Error(
                    'Not Able to Find The Subscription ID to Update the Subscription'
                )
            }
            console.log('UPDATING THE SUBSCRIPTION');
            const currentSubscriptionDetails = await stripe.subscriptions.retrieve(subscriptionExists.Subscription.subscriptionId)
            const subscription = await stripe.subscriptions.update(subscriptionExists.Subscription.subscriptionId,{
                items: [
                    {
                        id: currentSubscriptionDetails.items.data[0].id,
                        deleted: true,
                    },
                    {price: priceId},
                ],
                expand: ['latest_invoice.payment_intent'],
            })
            return NextResponse.json({
                subscriptionId: subscription.id,
                //@ts-ignore
                clientSecret: subscription.latest_invoice.payment_intent.client_secret,
            })
        }else{
            console.log('CREATING A SUB');
            const subscription = await stripe.subscriptions.create({
                customer: customerId,
                items: [
                    {
                        price: priceId,
                    },
                ],
                payment_behavior: 'default_incomplete',
                payment_settings: {save_default_payment_method: 'on_subscription'},
                expand: ['latest_invoice.payment_intent'],
            })
            return NextResponse.json({
                subscriptionId: subscription.id,
                //@ts-ignore
                clientSecret: subscription.latest_invoice.payment_intent.client_secret,
            })
            
        }
    } catch (error) {
        console.log('🔴 Error',error);
        return new NextResponse('INTERNAL SERVER ERROR',{
            status: 500,
        })
        
    }
}