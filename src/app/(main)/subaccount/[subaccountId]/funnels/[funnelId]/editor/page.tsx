import BlurPage from '@/components/global/blur-page';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getFunnel } from '@/lib/queries';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import React from 'react'
import FunnelSteps from '../_components/funnel_steps';
import FunnelSettings from '../_components/funnel_settings';
import { db } from '@/lib/db';
import EditorProvider from '@/providers/editor/editor-provider';
import FunnelEditorNavigator from './[funnelPageId]/_components/funnel-editor-navigation';
import FunnelEditor from './[funnelPageId]/_components/funnel-editor';
import FunnelEditorSidebar from './[funnelPageId]/_components/funnel_editor_sidebar';


type Props = {
    params: {funnelPageId: string; funnelId: string; subaccountId: string} 
}
const FunnelPage = async({params}: Props) => {
    const funnelPageDetails = await db.funnelPage.findFirst({
        where: {
            id: params.funnelPageId
        }
    })
    if(!funnelPageDetails)
        return redirect(`/subaccount/${params.subaccountId}/funnels/${params.funnelId}`)
  return (
    <div className='fixed top-0 bottom-0 left-0 right-0 z-[20] bg-background overflow-hidden'>
        <EditorProvider subaccountId={params.subaccountId} funnelId={params.funnelId} pageDetails={funnelPageDetails}>
            <FunnelEditorNavigator
                funnelId={params.funnelId}
                funnelPageDetails={funnelPageDetails}
                subaccountId={params.subaccountId}
            />
            <div className='h-full flex justify-center'>
                <FunnelEditor funnelPageId={params.funnelPageId}/>
            </div>
            <FunnelEditorSidebar subaccountId={params.subaccountId}/>
        </EditorProvider>
    </div>
  )
}

export default FunnelPage