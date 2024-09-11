import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { db } from '@/lib/db'
import { Funnel } from '@prisma/client'
import React from 'react'
import FunnelProductsTable from './funnel_products_table'
import { getConnectAccountProducts } from '@/lib/stripe/stripe-actions'
import FunnelForm from '@/components/forms/funnel-form'


interface FunnelSettingsProps {
    subaccountId: string
    defaultData: Funnel
}

const FunnelSettings: React.FC<FunnelSettingsProps> = async({
    subaccountId,
    defaultData
}) => {
    const subaccountDetails = await db.subAccount.findUnique({
        where:{
            id:subaccountId
        },
    })
    if(!subaccountDetails) return
    if(!subaccountDetails.connectAccountId) return
    const products = await getConnectAccountProducts(
        subaccountDetails.connectAccountId
    )
  return (
    <div className='flex gap-4 flex-col xl:!flex-row'>
        <Card className='flex-1 flex-shrink'>
            <CardHeader>
                <CardTitle>Funnel Products</CardTitle>
                <CardDescription>
                    Please Select The Products and Services you Wish to Sell On This Funnel.
                    You Can Sell One Time and Recurring Products Too.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <>
                    {subaccountDetails.connectAccountId ? (
                        <FunnelProductsTable defaultData={defaultData} products={products}/>
                    ): (
                        'Connect Your Stripe Account To Sell Products'
                    )}
                </>
            </CardContent>
        </Card>
        <FunnelForm subAccountId={subaccountId} defaultData={defaultData}/>
    </div>
  )
}

export default FunnelSettings