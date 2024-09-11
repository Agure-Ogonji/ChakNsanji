import { stripe } from "@/lib/stripe"
import { subscriptionCreated } from "@/lib/stripe/stripe-actions"
import { headers } from "next/headers"
import { NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"

const stripeWebhookEvents = new Set([
    'product.created',
    'product.updated',
    'price.created',
    'price.updated',
    'checkout.session.completed',
    'customer.subscription.created',
    'customer.subscription.updated',
    'customer.subscription.deleted',
])

export async function POST(req: NextRequest){
    let stripeEvent: Stripe.Event
    const body = await req.text()
    const sig = headers().get('Stripe-Signature')
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET_LIVE ?? process.env.STRIPE_WEBHOOK_SECRET


    try {
        if(!sig || !webhookSecret){
            console.log('🔴 ERROR STRIPE WEBHOOK SECRET OR THE SIGNATURE DOES NOT EXIST');
            return
        }
        stripeEvent = stripe.webhooks.constructEvent(body, sig, webhookSecret)
    } catch (error: any) {
        console.log(`🔴 Error ${error.message}`);
        return new NextResponse(`WEBHOOK ERROR: ${error.message}`, {status: 400})
        
    }

        
    try {
     if(stripeWebhookEvents.has(stripeEvent.type)){
        const subscription = stripeEvent.data.object as Stripe.Subscription
        if(!subscription.metadata.connectAccountPayments && !subscription.metadata.connectAccountSubscriptions){
            switch (stripeEvent.type) {
                case 'customer.subscription.created':
                case 'customer.subscription.updated':{
                    if(subscription.status === 'active'){
                        await subscriptionCreated(subscription, subscription.customer as string)
                        console.log('CREATED FROM WEBHOOK 💳', subscription);
                    }else{
                        console.log('SKIPPED AT CREATED FROM WEBHOOK 💳 because Subscription Status is not Active', subscription);
                        break
                    }
                }
                default:
                    console.log('👉🏻 UNHANDLED RELEVANT EVENT!', stripeEvent.type);
            }
        }else{
            console.log('SKIPPED FROM WEBHOOK 💳 because Subscription was from a Connected Account not for The Application', subscription);
            
        }
     }   
    } catch (error) {
        console.log(error);
        return new NextResponse('🔴 WEBHOOK ERROR', {status: 400})
    }
    return NextResponse.json({
        webhookActionReceived: true,
    },{
        status: 200
    })
}
