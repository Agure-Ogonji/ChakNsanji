'use client'
import CreateLaneForm from '@/components/forms/lane-form'
import React, { Dispatch, SetStateAction, useMemo } from 'react'
import { useModal } from '@/providers/modal-provider'
import { useRouter } from 'next/navigation'
import { LaneDetail, TicketWithTags } from '@/lib/types'
import CustomModal from '@/components/global/custom-modal'
import { deleteLane, saveActivityLogsNotification } from '@/lib/queries'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Edit, MoreVertical, PlusCircleIcon, Trash } from 'lucide-react'
import PipelineTicket from './pipeline-ticket'
import TicketForm from '@/components/forms/ticket-form'
import { Draggable, Droppable } from 'react-beautiful-dnd'
interface PipelineLaneProps{
    setAllTickets: Dispatch<SetStateAction<TicketWithTags>>
    allTickets: TicketWithTags
    tickets: TicketWithTags
    pipelineId: string
    laneDetails: LaneDetail
    subaccountId: string
    index: number
}
const PipelineLane: React.FC<PipelineLaneProps> = ({
    setAllTickets,
    allTickets,
    tickets,
    pipelineId,
    laneDetails,
    subaccountId,
    index
}) => {
    const {setOpen} = useModal()
    const router = useRouter()

    const amt = new Intl.NumberFormat(undefined, {
        style: 'currency',
        currency: 'USD',
    })

    const laneAmt = useMemo(()=>{
      console.log(tickets);
      return tickets.reduce(
        (sum, ticket) => sum + (Number(ticket?.value) || 0),0
      )
    }, [tickets])
    const randomColor = `#${Math.random().toString(16).slice(2,8)}`

    const addNewTicket = (ticket: TicketWithTags[0])=>{
      setAllTickets([...allTickets, ticket])
    }

    const handleCreateTicket = () => {
      setOpen(
        <CustomModal
          title='CREATE A TICKET'
          subheading='Tickets are a great way to keep track of tasks'
        >
          <TicketForm getNewTicket={addNewTicket} laneId={laneDetails.id} subaccountId={subaccountId}/>
        </CustomModal>
      )
    }
    const handleEditLane = () =>{
      setOpen(
        <CustomModal title='EDIT LANE DETAILS' subheading=''>
          <CreateLaneForm pipelineId={pipelineId} defaultData={laneDetails} />
        </CustomModal>
      )
    }
    const handleDeleteLane = async() =>{
      try {
        const response = await deleteLane(laneDetails.id)
        await saveActivityLogsNotification({
          agencyId: undefined,
          description: `DELETE A LANE | ${response?.name}`,
          subaccountId,
        })
        router.refresh()
      } catch (error) {
        console.log(error);
      }
    }
  return (
    <Draggable
      draggableId={laneDetails.id.toString()}
      index={index}
      key={laneDetails.id}
    >
      {(provided, snapshot)=>{
      if(snapshot.isDragging){
          const offset = {x: 300, y: 20}
          //@ts-ignore
          const x = provided.draggableProps.style?.left - offset.x
          
          //@ts-ignore
          const y = provided.draggableProps.style?.left - offset.y

          
          //@ts-ignore
          provided.draggableProps.style = {
              ...provided.draggableProps.style,
              top: y,
              left: x
          }
      }
      return (
        <div {...provided.draggableProps} ref={provided.innerRef} className='h-full'>
        <AlertDialog>
            <DropdownMenu>
              <div className='bg-slate-200/30 dark:bg-backround/20 h-[700px] w-[300px] px-4 relative rounded-lg overflow-visible flex-shrink-0'>
                <div className='h-14 backdrop-blur-lg dark:bg-background/40 bg-slate-200/60 absolute top-0 left-0 right-0 z-10' {...provided.dragHandleProps}>
                  <div className='h-full flex items-center p-4 justify-between cursor-grab border-b-[1px]'>
                    <div className='flex items-center w-full gap-2'>
                      <div className={cn('w-4 h-4 rounded-full')} style={{background: randomColor}}/>
                        <span className='font-bold text-sm'>
                          {laneDetails.name}
                        </span>
                      </div>
                      <div className='flex items-center flex-row'>
                        <Badge className='bg-white text-black'>
                          {amt.format(laneAmt)}
                        </Badge>
                        <DropdownMenuTrigger>
                          <MoreVertical className='text-muted-foreground cursor-pointer'/>
                        </DropdownMenuTrigger>
                      </div>
                    </div>
                  </div>
                  <Droppable droppableId={laneDetails.id.toString()} key={laneDetails.id} type="ticket">
                    {(provided)=>(
                      <div className='max-h-[700px] overflow-scroll pt-12'>                  
                        <div className='mt-2'
                          {...provided.droppableProps}
                          ref={provided.innerRef}
                        >
                            {tickets.map((ticket, index)=>(
                              <PipelineTicket
                                allTickets={allTickets}
                                setAllTickets={setAllTickets}
                                subaccountId={subaccountId}
                                ticket={ticket}
                                index={index}
                                key={ticket.id.toString()}
                              />
                            ))}
                            {provided.placeholder}
                        </div>
                      </div>
                    )}
                  </Droppable>
              
                  <DropdownMenuContent>
                    <DropdownMenuLabel>
                        Options
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator/>
                    <AlertDialogTrigger>
                        <DropdownMenuItem className="flex items-center gap-2">
                            <Trash size={15}/> DELETE
                        </DropdownMenuItem>
                    </AlertDialogTrigger>
                    <DropdownMenuItem className='flex items-center gap-2' onClick={handleEditLane}>
                            <Edit size={15}/> EDIT
                    </DropdownMenuItem>
                    <DropdownMenuItem className='flex items-center gap-2' onClick={handleCreateTicket}>
                            <PlusCircleIcon size={15}/> Create Ticket
                    </DropdownMenuItem>
                </DropdownMenuContent>
              </div>
              <AlertDialogContent>
                  <AlertDialogHeader>
                      <AlertDialogTitle>ARE YOU SURE?</AlertDialogTitle>
                      <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete
                          the ticket and remove it from our servers.
                      </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter className='flex items-center'>
                      <AlertDialogCancel>CANCEL</AlertDialogCancel>
                      <AlertDialogAction className='bg-destructive' onClick={handleDeleteLane}>Continue</AlertDialogAction>
                  </AlertDialogFooter>
              </AlertDialogContent>

            </DropdownMenu>
      </AlertDialog>
    </div>
)
}}
    </Draggable>
  )
}

export default PipelineLane