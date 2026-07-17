<?php

namespace App\Actions\Excel;

use Carbon\Carbon;
use Illuminate\Support\Facades\Storage;
use PhpOffice\PhpSpreadsheet\IOFactory;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;

class ExportFile
{
    public function writeExcel(array $replayUsersBalance)
    {
        $spreadSheetFile = public_path("EXPORTING_FILE.xlsx");

        $spreadSheet = IOFactory::load($spreadSheetFile);

        $activeSheet = $spreadSheet->getActiveSheet();

        // balances = [] - 3
        // events = [][] - n
        // name

        $cellStart = 6;

        foreach ($replayUsersBalance as $replay) {

            $name     = $replay['name'];
            $balances = $replay['balances'];
            $events   = $replay['events'];
            $leaves   = $replay['leaves'];
            $date = Carbon::parse($replay['date']);

            // name
            $activeSheet->setCellValue("B$cellStart", $name);

            $firstHalfRow  = $cellStart;
            $secondHalfRow = $cellStart;


            $firstHalfEvents = [];
            $secondHalfEvents = [];

            foreach ($events as $event) {
                if ($event['day'] <= 15) {
                    $firstHalfEvents[] = $event['label'];
                    $activeSheet->setCellValue("E$firstHalfRow", $event['hours'] <= 0 ? '' : $event['hours']);
                    $activeSheet->setCellValue("F$firstHalfRow", $event['minutes'] <= 0 ? '' : $event['minutes']);
                } else {
                    $secondHalfEvents[] = $event['label'];
                    $activeSheet->setCellValue("H$secondHalfRow", $event['hours'] <= 0 ? '' : $event['hours']);
                    $activeSheet->setCellValue("I$secondHalfRow", $event['minutes'] <= 0 ? '' : $event['minutes']);
                }
            }

            $activeSheet->setCellValue("D$cellStart", implode("\n", $firstHalfEvents));
            $activeSheet->setCellValue("G$cellStart", implode("\n", $secondHalfEvents));


            $allLeaves = [];
            foreach ($leaves as $leave) {
                $allLeaves[] = $leave["label"];
            }
            $activeSheet->setCellValue("J$cellStart", implode("\n", $allLeaves));



            foreach ($balances as $balance) {
                if ($balance['leave_type'] == 'vacation leave') {
                    $activeSheet->setCellValue("N$cellStart", $balance['estimatedBalance']);
                } else if ($balance['leave_type'] == 'sick leave') {
                    $activeSheet->setCellValue("O$cellStart", $balance['estimatedBalance']);
                } else {
                    continue;
                }
            }

            $activeSheet->setCellValue("K$cellStart", $replay['tardinessCount'] <= 0 ? '' : $replay['tardinessCount']);
            $activeSheet->setCellValue("L$cellStart", $replay['undertimeCount'] <= 0 ? '' : $replay['undertimeCount']);

            $cellStart = max($firstHalfRow, $secondHalfRow) + 1;
        }


        $outputFileName = "reports/{$date?->format('F_Y')}.xlsx";

        $filename = $date?->format('F_Y') . '.xlsx';
        $outputPath = storage_path('app/public/' . $outputFileName);

        $url = asset('storage/' . $outputFileName);

        if (!file_exists(dirname($outputPath))) {
            mkdir(dirname($outputPath), 0755, true);
        }

        $writer = new Xlsx($spreadSheet);
        $writer->save($outputPath);

        // reports/filename.xlsx, mao ni ang pangitaon para edownload
        return $url;
    }
}
