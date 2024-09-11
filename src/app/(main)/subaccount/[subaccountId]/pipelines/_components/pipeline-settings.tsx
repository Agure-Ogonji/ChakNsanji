'use client'
import CreatePipelineForm from '@/components/forms/create-pipeline-form'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { toast } from '@/components/ui/use-toast'
import { deletePipeline } from '@/lib/queries'
import { Pipeline } from '@prisma/client'
import { useRouter } from 'next/navigation'
import React from 'react'


const PipelineSettings = ({
  pipelineId,
  subaccountId,
  pipelines
}: {
  pipelineId: string
  subaccountId: string
  pipelines: Pipeline[]
}) => {
  const router = useRouter()
  return (
    <AlertDialog>
      <div>
        <div className='flex items-center justify-between mb-4'>
          <AlertDialogTrigger asChild>
            <Button variant={'destructive'}>DELETE PIPELINE</Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>ARE YOU SURE?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete your
                account and remove your data from our servers
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className='items-center'>
              <AlertDialogCancel>CANCEL</AlertDialogCancel>
              <AlertDialogAction
                onClick={async () =>{
                  try {
                    await deletePipeline(pipelineId)
                    toast({
                      title: 'DELETED',
                      description: 'PIPELINE IS DELETED'
                    })
                    router.replace(`/subaccount/${subaccountId}/pipelines`)
                  } catch (error) {
                    toast({
                      variant: 'destructive',
                      title: 'Oppse!',
                      description: 'DELETED PIPELINE'
                    })
                  }
                }}
              >
                DELETE
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </div>
        <CreatePipelineForm subAccountId={subaccountId} defaultData={pipelines.find((p)=>p.id === pipelineId)}/>
      </div>
    </AlertDialog>
  )
}

export default PipelineSettings