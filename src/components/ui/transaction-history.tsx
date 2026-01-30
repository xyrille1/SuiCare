import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { SuiObjectData } from "@mysten/sui.js/client";
import { format } from "date-fns";

interface TransactionHistoryUIProps {
  data: SuiObjectData[] | undefined;
  isLoading: boolean;
  isError: boolean;
}

export function TransactionHistoryUI({ data, isLoading, isError }: TransactionHistoryUIProps) {
  if (isLoading) {
    return <div>Loading transaction history...</div>;
  }

  if (isError) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>Failed to load transaction history.</AlertDescription>
      </Alert>
    );
  }

  if (!data || data.length === 0) {
    return (
        <Alert>
            <AlertTitle>No Donations</AlertTitle>
            <AlertDescription>There have been no donations to this campaign yet.</AlertDescription>
        </Alert>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Donor</TableHead>
          <TableHead>Amount (SUI)</TableHead>
          <TableHead>Date</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((donation) => {
          if (donation.content?.dataType !== 'moveObject') {
            return (
                <TableRow key={donation.objectId}>
                    <TableCell colSpan={3} className="text-center text-muted-foreground">
                        Could not display this donation data (not a move object).
                    </TableCell>
                </TableRow>
            );
          }

          const fields = donation.content.fields as any;
          const { donor, amount, timestamp } = fields;

          if (donor === undefined || amount === undefined || timestamp === undefined) {
            return (
                <TableRow key={donation.objectId}>
                    <TableCell colSpan={3} className="text-center text-muted-foreground">
                        Could not display this donation data (missing fields).
                    </TableCell>
                </TableRow>
            );
          }

          return (
            <TableRow key={donation.objectId}>
              <TableCell className="font-mono text-xs max-w-[120px] truncate" title={donor}>
                {donor}
              </TableCell>
              <TableCell>{(Number(amount) / 1_000_000_000).toFixed(4)}</TableCell>
              <TableCell>{format(new Date(parseInt(timestamp, 10)), 'PPpp')}</TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
